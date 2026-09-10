namespace IDS_API_Project.Common;

/* things like "you are not assigned to this product" or "email already in
   use" are expected outcomes, not bugs, so services return a Result instead
   of throwing for them, actual exceptions stay reserved for actual bugs */
public record Result<T>(bool Success, T? Value, string? Error)
{
    public static Result<T> Ok(T value) => new(true, value, null);
    public static Result<T> Fail(string error) => new(false, default, error);
}
