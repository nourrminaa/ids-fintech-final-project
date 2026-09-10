using IDS_API_Project.Models;

namespace IDS_API_Project.Dtos;

/* everything the Client Details page needs, one QueryMultiple call in
   ClientRepository.GetDetails, ResponsibleTeam is already deduplicated by
   TeamMemberId and merged from both ClientResponsibility directly and
   ProductResponsibility of whatever products this client uses, same as the
   mock frontend behaviour, just done in SQL/C# instead of in React state */
public record ClientDetails(
    Client Client,
    List<DeploymentView> Deployments,
    List<ClientResponsibilityView> ResponsibleTeam
);
