using System.Text;
using DotNetEnv;
using IDS_API_Project.Repositories;
using IDS_API_Project.Security;
using IDS_API_Project.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Data.SqlClient;
using Microsoft.IdentityModel.Tokens;

// same idea as the async assignment project, when the app starts this file
// runs first, sets up the web server, loads the environment variables, wires
// up dependency injection, then launches the api

Env.Load();

var builder = WebApplication.CreateBuilder(args);

// read the database values from the .env file, same pattern as before, just
// with a couple more variables now for JWT and CORS
var server = Environment.GetEnvironmentVariable("DB_SERVER");
var database = Environment.GetEnvironmentVariable("DB_NAME");
var user = Environment.GetEnvironmentVariable("DB_USER");
var password = Environment.GetEnvironmentVariable("DB_PASSWORD");

var connectionString = $"Server={server};" + $"Database={database};" + $"User Id={user};" + $"Password={password};" + $"TrustServerCertificate=True;";
builder.Configuration["ConnectionStrings:Default"] = connectionString;

// same trick for the JWT settings, keeping the secret out of appsettings.json
// and out of source control entirely, it only ever lives in .env
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET")!;
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER")!;
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE")!;
var jwtExpiryMinutes = Environment.GetEnvironmentVariable("JWT_EXPIRY_MINUTES") ?? "120";
builder.Configuration["Jwt:Secret"] = jwtSecret;
builder.Configuration["Jwt:Issuer"] = jwtIssuer;
builder.Configuration["Jwt:Audience"] = jwtAudience;
builder.Configuration["Jwt:ExpiryMinutes"] = jwtExpiryMinutes;

var corsAllowedOrigin = Environment.GetEnvironmentVariable("CORS_ALLOWED_ORIGIN") ?? "http://localhost:5173";
const string CorsPolicyName = "FrontendPolicy";

// Services:
builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    // only the frontend's own origin gets in, and only the methods/headers it
    // actually needs, this is not "allow everything", that would defeat the
    // point of having CORS at all
    options.AddPolicy(CorsPolicyName, policy =>
    {
        policy.WithOrigins(corsAllowedOrigin)
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
    };
});

builder.Services.AddAuthorization(options =>
{
    // this is the policy UsersController is gated behind, keeps section 4.1
    // of the spec ("only an Admin should manage users") enforced server side
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
});

builder.Services.AddSingleton<JwtTokenGenerator>();

// repositories, one per entity, same registration style as before, just more
// of them now
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ITeamMemberRepository, TeamMemberRepository>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IClientRepository, ClientRepository>();
builder.Services.AddScoped<IDeploymentRepository, DeploymentRepository>();
builder.Services.AddScoped<IDashboardRepository, DashboardRepository>();

// services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ITeamMemberService, TeamMemberService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IClientService, ClientService>();
builder.Services.AddScoped<IDeploymentService, DeploymentService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();

// Build the app:
var app = builder.Build();

// Middleware, order actually matters here, this has to wrap everything else
// so it can catch whatever they throw, CORS has to come before auth, and
// auth has to come before controllers get to run:
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    // several tables (Deployments -> Products, DeploymentModules -> Modules,
    // Users/ProductResponsibilities/ClientResponsibilities -> TeamMembers) do
    // not cascade on delete on purpose, deleting a row something else still
    // points to used to bubble up as a raw unhandled 500, this turns that into
    // a real 409 with a message instead
    catch (SqlException ex) when (ex.Number == 547)
    {
        context.Response.StatusCode = StatusCodes.Status409Conflict;
        await context.Response.WriteAsJsonAsync(new
        {
            message = "This record is still referenced by other data and can't be deleted or changed."
        });
    }
});

app.UseHttpsRedirection();
app.UseCors(CorsPolicyName);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();