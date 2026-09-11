using IDS_API_Project.Models;

namespace IDS_API_Project.Dtos;

/* everything the Client Details page needs, one QueryMultiple call in
   ClientRepository.GetDetails, ResponsibleTeam is direct ClientResponsibility
   only, no longer folded in with whoever is responsible for a product this
   client happens to use, that merge was making unrelated people show up as
   able to edit clients they were never actually assigned to. CanEdit is
   filled in by ClientService.GetDetails, which is the only layer that knows
   who's asking */
public record ClientDetails(
    Client Client,
    List<DeploymentView> Deployments,
    List<ClientResponsibilityView> ResponsibleTeam,
    bool CanEdit
);