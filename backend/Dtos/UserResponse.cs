namespace IDS_API_Project.Dtos;

// what actually leaves the api for a User, PasswordHash never gets this far,
// there is no reason for a hash to travel over the wire even to the frontend
// that is supposed to be trusted, it just should not exist outside this api
public record UserResponse(int Id, string Email, string Role, bool IsActive, int? TeamMemberId);
