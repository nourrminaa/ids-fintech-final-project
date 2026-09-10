namespace IDS_API_Project.Dtos;

// one row on the flat /deployments list, both names come along through a join
// so the page does not need to fetch products and clients separately just to
// show them
public record DeploymentListItem(
    int Id,
    int ClientId,
    string ClientName,
    int ProductId,
    string ProductName,
    string ProductVersion,
    DateTime? GoLiveDate,
    string DeploymentStatus,
    string SupportTier
);
