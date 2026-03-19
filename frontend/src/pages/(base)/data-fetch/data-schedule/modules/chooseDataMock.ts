export type SelectableProjectItem = Api.DataSchedule.SelectDataProject;

export function filterSelectableProjects(projects: SelectableProjectItem[], keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) {
    return projects;
  }

  return projects.filter(project => {
    const values = [project.projectName, project.projectId, project.industry];
    return values.some(value => value.toLowerCase().includes(normalizedKeyword));
  });
}
