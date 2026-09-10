using System.Security.Claims;

namespace IDS_API_Project.Security;

/* centralizes the "admin edits anything, assigned employees edit only their
   own products/clients" rule, so ProductService and ClientService both call
   the same two helpers instead of each carrying their own copy of this logic */
public static class PermissionChecker
{
    public static bool IsAdmin(ClaimsPrincipal user) => user.IsInRole("Admin");

    public static int? GetTeamMemberId(ClaimsPrincipal user)
    {
        var claim = user.FindFirst("TeamMemberId");
        return claim is null ? null : int.Parse(claim.Value);
    }
}
