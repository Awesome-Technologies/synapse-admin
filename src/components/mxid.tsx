
/**
 * Check if a user is managed by an application service
 * @param id The user ID to check
 * @returns Whether the user is managed by an application service
 */
export const isASManaged = (id: string) => {
  const managedUsersString = localStorage.getItem("as_managed_users");
  try {
    const asManagedUsers = JSON.parse(managedUsersString).map(regex => new RegExp(regex));
    return asManagedUsers.some(regex => regex.test(id));
  } catch (e) {
    return false;
  }
};
