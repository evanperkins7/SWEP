export const avatarOptions = {
  gender: [
    { value: "unspecified", label: "Prefer not to say" },
    { value: "woman", label: "Woman" },
    { value: "man", label: "Man" },
    { value: "nonbinary", label: "Nonbinary" },
  ],
  skin: [
    { value: "#f3d5b5", label: "Porcelain" },
    { value: "#e5b389", label: "Warm beige" },
    { value: "#c88d65", label: "Golden brown" },
    { value: "#9b6348", label: "Rich brown" },
    { value: "#634334", label: "Deep brown" },
  ],
  hairStyle: [
    { value: "short", label: "Short" },
    { value: "bob", label: "Bob" },
    { value: "long", label: "Long" },
    { value: "curly", label: "Curly" },
    { value: "bun", label: "Bun" },
    { value: "bald", label: "No hair" },
  ],
  hairColor: [
    { value: "#382f2d", label: "Black" },
    { value: "#76503c", label: "Brown" },
    { value: "#d6b66e", label: "Blond" },
    { value: "#ae5b3d", label: "Auburn" },
    { value: "#bab6b1", label: "Silver" },
    { value: "#9476b2", label: "Lavender" },
  ],
  eyeColor: [
    { value: "#664633", label: "Brown" },
    { value: "#53819a", label: "Blue" },
    { value: "#65805a", label: "Green" },
    { value: "#9b854b", label: "Hazel" },
    { value: "#727d86", label: "Gray" },
  ],
  outfit: [
    { value: "tee", label: "T-shirt" },
    { value: "hoodie", label: "Hoodie" },
    { value: "overalls", label: "Overalls" },
  ],
  shirtColor: [
    { value: "#739066", label: "Sage" },
    { value: "#b96850", label: "Terracotta" },
    { value: "#788fb0", label: "Blue" },
    { value: "#a28db6", label: "Lilac" },
    { value: "#d1ad62", label: "Mustard" },
    { value: "#eee7d7", label: "Cream" },
    { value: "#454b52", label: "Charcoal" },
  ],
  pantsColor: [
    { value: "#50677e", label: "Denim" },
    { value: "#45474a", label: "Charcoal" },
    { value: "#a38c69", label: "Khaki" },
  ],
} as const;
export type Avatar = {
  [K in keyof typeof avatarOptions]: (typeof avatarOptions)[K][number]["value"];
};
export const defaultAvatar: Avatar = {
  gender: "unspecified",
  skin: "#e5b389",
  hairStyle: "short",
  hairColor: "#76503c",
  eyeColor: "#664633",
  outfit: "tee",
  shirtColor: "#739066",
  pantsColor: "#50677e",
};
// Older saved students have no avatar; unknown options also use these defaults.
export function normalizeAvatar(value?: Partial<Avatar> | null): Avatar {
  const avatar = { ...defaultAvatar };
  for (const key of Object.keys(avatarOptions) as (keyof Avatar)[]) {
    const candidate = value?.[key];
    if (avatarOptions[key].some((option) => option.value === candidate))
      Object.assign(avatar, { [key]: candidate });
  }
  return avatar;
}
export function sampleAvatar(index: number): Avatar {
  return {
    ...defaultAvatar,
    skin: avatarOptions.skin[index % 5].value,
    hairStyle: avatarOptions.hairStyle[index % 6].value,
    hairColor: avatarOptions.hairColor[index % 6].value,
    eyeColor: avatarOptions.eyeColor[index % 5].value,
    outfit: avatarOptions.outfit[index % 3].value,
    shirtColor: avatarOptions.shirtColor[index % 7].value,
  };
}
