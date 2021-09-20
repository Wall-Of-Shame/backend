export function isUserInitiated(args: {
  username?: any;
  name?: any;
  avatarAnimal?: any;
  avatarColor?: any;
  avatarBg?: any;
}): boolean {
  const { username, name, avatarAnimal, avatarColor, avatarBg } = args;
  if (!username || !name || !avatarAnimal || !avatarColor || !avatarBg) {
    return false;
  }
  return true;
}
