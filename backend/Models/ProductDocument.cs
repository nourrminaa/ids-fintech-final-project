namespace IDS_API_Project.Models;

// named ProductDocument, not Document, so it never clashes with the DOM's own
// Document type on the frontend side, kept the same name here for consistency
public record ProductDocument(
    int Id,
    int ProductId,
    string DocumentName,
    string DocumentType,
    string? Description,
    string UrlOrFileReference,
    DateTime? LastUpdatedDate
);
