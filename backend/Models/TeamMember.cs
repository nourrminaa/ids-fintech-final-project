namespace IDS_API_Project.Models;

/* an actual IDS Fintech employee, not every TeamMember has a login to the portal
   itself, that is what User is for, see User.cs for how the two connect */

public record TeamMember(int Id, string FullName, string JobTitle, string Department, string Email, string Status);
