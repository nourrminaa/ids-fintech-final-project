# IDS Fintech Project: Company Products Portal

This project serves as an internal web portal built during an internship at IDS Fintech. The goal is simple: give employees one place to see every product the company has, every client using those products, what version each client is on, which environments exist for each deployment and who on the team is responsible for what.

_Disclaimer: I aimed to mirror the color palette, typography and overall UX/UI design of the default IDS Fintech website ensuring the product feels like a natural extension of the existing brand ecosystem rather than a standalone design._

## 1. The Problem This Solves

Before this existed, answering a question like "which version of the payment platform does ABC Bank use" or "who do I even ask about this module" meant pinging the right person and hoping they remembered. The portal turns that tribal knowledge into structured, searchable data. An employee should be able to open the app and answer questions like:

- Which clients use this product
- What version is deployed for a specific client
- What environments exist for that deployment
- Who is responsible for this product or this client
- Where the repository and the documentation live

## 2. Architecture

The system is a simple monolith. The flow is:

React Frontend → REST API → ASP.NET Core Web API → Dapper → Database

The frontend never talks to the database directly. It only ever calls the API over HTTP, and the API is the only thing that touches the database. Business logic, validation and authentication all live on the backend, which keeps the frontend fairly dumb (in a good way) and the security boundary in one predictable place.

_Note: A quick note on naming, since this trips people up: ".NET" is the overall platform, "ASP.NET Core" is Microsoft's framework for building web apps on top of it and "ASP.NET Core Web API" is the specific piece used to expose REST endpoints. So when people say ".NET Web API" the more accurate phrase is "ASP.NET Core Web API built with .NET 10." And yes, this project genuinely needs an API. Not every website is one, but the moment the frontend and backend are separate processes talking over HTTP, that's what makes it an API in the first place._

## 3. Tech Stack

**Backend**

- .NET 10
- ASP.NET Core Web API
- Dapper (lightweight data access instead of a full ORM)
- JWT for authentication

**Frontend**

- React with TypeScript
- Vite
- Tailwind

**Database**

- PostgreSQL, run locally through Docker for development

**Technologies used**

- Docker + SQL Server for local development
- DBeaver for database browsing and query testing
- Vs Code for development with the C# and React extensions installed
- Postman for API testing
- Obsidian for personal note taking and project planning

## 4. Data Model

The whole schema really has two "spines" that meet in the middle.

**Product's spine**: a Product owns its Modules (the functional pieces it's broken into), its Repositories, its Documentation links and its team assignments through Product Responsibility.

**Client's spine**: a Client has its own responsible team members the same way, through Client Responsibility.

These two spines meet at **Deployment**, which is the join between a specific Client and a specific Product. A deployment is not just "this client uses this product," it carries its own data too: which version, go live date, deployment status, support tier and notes specific to that client's setup.

From there, Deployment fans out further:

- **Environment** represents the actual instances of that deployment (development, testing, UAT, production). For example, a payment platform deployment might have IDS developers working in development, IDS QA in testing, both the client and IDS in UAT and the client's real users in production.
- **Deployment Module** is a junction that tracks which of the product's modules are actually enabled for that specific client.

A **User** is a login account, and it optionally maps to one **Team Member**, since not every employee tracked in the system necessarily needs to log into the portal itself. Users are either Employees or Admins, and only Admins can manage other users.

Everything else (repositories, documents, environments, responsibilities) is deliberately kept off separate pages where possible and managed from the related Product or Client screen instead, to keep the number of pages small and the navigation simple.

## 5. Core Features

- User login and logout, with role based access (Admin vs Employee)
- Full CRUD on Products, including their Modules
- Full CRUD on Clients
- Assigning Products to Clients as Deployments, with version, modules enabled, go live date, status and support tier
- Managing Environments per deployment
- Managing Team Members and their responsibilities on products and clients
- Storing links to repositories and documentation (links only)
- Search and filtering across products, clients and deployments
- A dashboard giving a quick overview (total products, active products, clients, deployments, team members and recent activity) with navigation shortcuts

## 6. API Endpoints

The API follows a consistent REST pattern across resources: list, get by id, create, update and delete, with the obvious exceptions (you don't delete a login session for example). The main resource groups are:

| Group                                 | Purpose                                     |
| ------------------------------------- | ------------------------------------------- |
| `/api/auth`                           | Login and logout, issues the JWT            |
| `/api/users`                          | Admin only, manage login accounts and roles |
| `/api/products`                       | Product CRUD                                |
| `/api/products/{id}/modules`          | Modules belonging to a product              |
| `/api/clients`                        | Client CRUD                                 |
| `/api/deployments`                    | Client to product assignments               |
| `/api/deployments/{id}/environments`  | Environments for a deployment               |
| `/api/team-members`                   | Employee records and their status           |
| `/api/products/{id}/responsibilities` | Who is responsible for a product and how    |
| `/api/products/{id}/repositories`     | Repository links for a product              |
| `/api/products/{id}/documents`        | Documentation links for a product           |
| `/api/dashboard`                      | Aggregated counts and recent activity       |

## 7. Authentication and Security

### 7.1. JWT

Login issues a JWT (JSON Web Token). The frontend sends it back on every request in the `Authorization` header, and the backend validates the signature on every single call. This is the actual security boundary of the whole app. Nothing else in the system is trusted unless this check passes.

### 7.2. CORS

Since the frontend and backend run on different ports during development, the browser's Same Origin Policy would normally block the frontend's JavaScript from calling the API at all. CORS is the mechanism that relaxes that, but only for one specific, explicitly allowed origin rather than for everyone. It's worth being clear about what CORS actually is: it's a rule the browser enforces, not the server. A tool like Postman or curl ignores it completely, since it isn't a wall against direct API abuse. It only stops a browser running JavaScript from some other website from quietly calling this API using someone else's session. The real protection is still the JWT check underneath it.

### 7.3. Why the Token Lives in localStorage and Not Just a Variable

A plain variable in JavaScript only exists while that code is running. Refresh the page and it's gone, which would make "stay logged in after a refresh" impossible. `localStorage` is different. It's a browser API that writes the value to disk, tied to the site's origin, and it survives refreshes, tab closes and even browser restarts. That persistence is the entire reason the token is stored there instead of in memory.

The frontend also decodes the token on page load to peek at its expiry and decide whether to show the user as logged in or send them to the login page. It's important to be clear that this decode is not a security check. It just reads the payload without verifying the signature, so a tampered token would still "look valid" to this check. That's fine, because it's only deciding a UX question. Every real API call still carries the token, and the backend verifies the actual signature regardless of what the frontend guessed. If someone hand edits a token, the frontend might be briefly fooled, but the backend won't be.

That same persistence cuts both ways though. Anything stored in localStorage is readable by any JavaScript running on that origin, including injected malicious script if the app ever has an XSS vulnerability. That tradeoff is discussed further down.

### 7.4. Password Hashing

When an account is created, the password is run through ASP.NET Identity's password hasher, and only the resulting hash is stored in the database. At login, the entered password is hashed the same way and compared against the stored hash rather than the raw password ever being compared directly. So the database only ever holds something like `AQAAAAIAAYag...` and never the actual password a user typed.

## 8. Getting Started

**8.1. Start the database**

```
docker run -e ACCEPT_EULA=1 -e MSSQL_SA_PASSWORD=67 -p 1433:1433 --name ids-sql --hostname ids-sql -d mcr.microsoft.com/mssql server:2022-latest
```

db script:

```
IF DB_ID('IdsProductsPortal') IS NULL
BEGIN
    CREATE DATABASE IdsProductsPortal
END
GO

USE IdsProductsPortal
GO

CREATE TABLE TeamMembers (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(150) NOT NULL,
    JobTitle NVARCHAR(150) NOT NULL,
    Department NVARCHAR(100) NOT NULL,
    Email NVARCHAR(200) NOT NULL UNIQUE,
    Status NVARCHAR(20) NOT NULL CHECK (Status IN ('Active', 'Inactive'))
)
GO

CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(200) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(300) NOT NULL,
    Role NVARCHAR(20) NOT NULL CHECK (Role IN ('Employee', 'Admin')),
    IsActive BIT NOT NULL DEFAULT 1,
    TeamMemberId INT NULL,
    FOREIGN KEY (TeamMemberId) REFERENCES TeamMembers(Id)
)
GO

CREATE TABLE Products (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(200) NOT NULL UNIQUE,
    Description NVARCHAR(MAX) NOT NULL,
    BusinessPurpose NVARCHAR(MAX) NOT NULL,
    LifecycleStatus NVARCHAR(20) NOT NULL CHECK (
        LifecycleStatus IN ('Active', 'Maintenance', 'Planned', 'Deprecated')
    ),
    CurrentVersion NVARCHAR(50) NOT NULL,
    SupportedMarkets NVARCHAR(500) NOT NULL DEFAULT '',
    Criticality NVARCHAR(20) NOT NULL CHECK (
        Criticality IN ('Low', 'Medium', 'High', 'Critical')
    ),
    Technologies NVARCHAR(500) NOT NULL DEFAULT '',
    Notes NVARCHAR(MAX) NULL
)
GO

CREATE TABLE Modules (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL,
    Name NVARCHAR(150) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    Status NVARCHAR(20) NOT NULL CHECK (
        Status IN ('Active', 'Planned', 'Deprecated')
    ),
    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE
)
GO

CREATE TABLE Clients (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CompanyName NVARCHAR(200) NOT NULL UNIQUE,
    Country NVARCHAR(100) NOT NULL,
    ContactInformation NVARCHAR(MAX) NULL,
    Status NVARCHAR(20) NOT NULL CHECK (
        Status IN ('Active', 'Onboarding', 'Inactive')
    ),
    Notes NVARCHAR(MAX) NULL
)
GO

CREATE TABLE Deployments (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ClientId INT NOT NULL,
    ProductId INT NOT NULL,
    ProductVersion NVARCHAR(50) NOT NULL,
    GoLiveDate DATE NULL,
    DeploymentStatus NVARCHAR(20) NOT NULL CHECK (
        DeploymentStatus IN ('Production', 'UAT', 'In Progress', 'Suspended')
    ),
    SupportTier NVARCHAR(20) NOT NULL CHECK (
        SupportTier IN ('Standard', 'Priority', 'Premium')
    ),
    ClientSpecificNotes NVARCHAR(MAX) NULL,
    FOREIGN KEY (ClientId) REFERENCES Clients(Id) ON DELETE CASCADE,
    FOREIGN KEY (ProductId) REFERENCES Products(Id)
)
GO

CREATE TABLE DeploymentModules (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    DeploymentId INT NOT NULL,
    ModuleId INT NOT NULL,
    FOREIGN KEY (DeploymentId) REFERENCES Deployments(Id) ON DELETE CASCADE,
    FOREIGN KEY (ModuleId) REFERENCES Modules(Id),
    UNIQUE (DeploymentId, ModuleId)
)
GO

CREATE TABLE Environments (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    DeploymentId INT NOT NULL,
    EnvironmentName NVARCHAR(150) NOT NULL,
    EnvironmentType NVARCHAR(20) NOT NULL CHECK (
        EnvironmentType IN ('Development', 'Testing', 'UAT', 'Production')
    ),
    Purpose NVARCHAR(MAX) NULL,
    ServerName NVARCHAR(150) NULL,
    OperatingSystem NVARCHAR(100) NULL,
    ApplicationUrl NVARCHAR(300) NULL,
    DatabaseInfo NVARCHAR(300) NULL,
    MonitoringLink NVARCHAR(300) NULL,
    AccessInstructions NVARCHAR(MAX) NULL,
    Notes NVARCHAR(MAX) NULL,
    FOREIGN KEY (DeploymentId) REFERENCES Deployments(Id) ON DELETE CASCADE
)
GO

CREATE TABLE ProductResponsibilities (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL,
    TeamMemberId INT NOT NULL,
    Responsibility NVARCHAR(150) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE,
    FOREIGN KEY (TeamMemberId) REFERENCES TeamMembers(Id)
)
GO

CREATE TABLE ClientResponsibilities (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ClientId INT NOT NULL,
    TeamMemberId INT NOT NULL,
    Responsibility NVARCHAR(150) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    FOREIGN KEY (ClientId) REFERENCES Clients(Id) ON DELETE CASCADE,
    FOREIGN KEY (TeamMemberId) REFERENCES TeamMembers(Id)
)
GO

CREATE TABLE Repositories (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL,
    Name NVARCHAR(150) NOT NULL,
    GitHubUrl NVARCHAR(300) NOT NULL,
    MainBranch NVARCHAR(100) NOT NULL DEFAULT 'main',
    Description NVARCHAR(MAX) NULL,
    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE
)
GO

CREATE TABLE Documents (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL,
    DocumentName NVARCHAR(200) NOT NULL,
    DocumentType NVARCHAR(50) NOT NULL CHECK (
        DocumentType IN (
            'Technical Documentation',
            'Functional Documentation',
            'Deployment Guide',
            'Architecture Diagram',
            'Postman Collection',
            'API Documentation',
            'Release Notes',
            'User Guide'
        )
    ),
    Description NVARCHAR(MAX) NULL,
    UrlOrFileReference NVARCHAR(300) NOT NULL,
    LastUpdatedDate DATE NULL,
    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE
)
GO

CREATE INDEX IX_Products_LifecycleStatus
ON Products(LifecycleStatus)

CREATE INDEX IX_Clients_Status
ON Clients(Status)

CREATE INDEX IX_Deployments_ClientId
ON Deployments(ClientId)

CREATE INDEX IX_Deployments_ProductId
ON Deployments(ProductId)

CREATE INDEX IX_Modules_ProductId
ON Modules(ProductId)
GO
```

**8.2. Run the backend**

```
dotnet run
```

**8.3. Generate real password hashes for the seeded users**

The seed data ships with placeholder password hashes since a real hash can't just be typed in by hand. To generate one, a small throwaway console project is used purely as a tool, separate from the actual backend:

```
dotnet new console -o HashTool
cd HashTool
dotnet add package Microsoft.Extensions.Identity.Core --version 10.0.10
```

Then use `PasswordHasher` to hash a known password (for example `Password123!`) and update the seeded users in the database with the generated hash instead of the placeholder. Once the seeded accounts are confirmed working, this `HashTool` project can be deleted. It was never part of the application, just a one time helper.

**8.4. Run the frontend**

```
npm install
npm run dev
```

The website should probably now be available at `http://localhost:5173` and the API at `http://localhost:5015`.

## 9. Out of Scope for This Version

A few things were intentionally left out of the first version to keep things focused on a solid, working MVP rather than trying to do everything at once:

- AI search or AI generated documentation
- Financial or profitability dashboards
- Approval workflows
- Advanced notifications
- Storing any actual secrets, passwords, API tokens or private keys anywhere in the app. Environments only store safe reference information or a pointer to the company's approved access process, never the credential itself.

## 10. Planned Improvements

**Refresh tokens.** Right now, a single JWT does both jobs: proving identity and staying valid for the whole session. That means if a token leaks, there's no way to kill it early since it's valid until it naturally expires. The plan is to split this into a short lived access token used for regular calls and a longer lived refresh token tracked server side in its own table. Since the refresh token is a real database record, it can be revoked. Logging out or detecting theft means marking it revoked, and it can never be used to get a new access token again, which is the one thing the current setup can't do at all. The cost is a bit of server side state in an otherwise fully stateless setup, but that tradeoff is worth it for real revocation.

**XSS hardening.** Since the JWT lives in localStorage, any script running on the page, including an injected malicious one, can read it just as easily as the app's own code does. The plan is to review where user supplied content gets rendered and make sure it's always properly escaped, add stricter content security policy headers and generally reduce the attack surface that would let a script get injected in the first place.

**Timing safe login.** A subtle issue with a lot of login endpoints is that checking "does this email exist" before "is this password correct" can leak information through response time alone. If a request for a valid email takes noticeably longer than one for an email that doesn't exist (because the valid one goes on to actually run the password hash comparison), an attacker can use that timing difference to figure out which emails are valid accounts, without ever guessing a password. The fix is to make sure both paths (valid email, invalid email) take roughly the same amount of time, generally by always running a hash comparison against something, even a dummy hash, when the email isn't found, instead of short circuiting and returning early.

**Thank you for reading this far! NM.**
