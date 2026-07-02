export function hasPostPermission(post, permission) {
  return post?._permissions?.includes(permission) ?? false;
}
