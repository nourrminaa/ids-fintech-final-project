namespace IDS_API_Project.Models;

/* ContactInformation is one free text field on purpose, not split into separate
   name/email/phone fields, this matches the ERD's single ContactInformation
   attribute exactly, do not split this back up without checking with the team */

public record Client(int Id, string CompanyName, string Country, string? ContactInformation, string Status, string? Notes);
