interface MemberAvatarProps {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-7 h-7 text-[10px]",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-xl",
};

export default function MemberAvatar({ name, color, size = "md" }: MemberAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ backgroundColor: color }}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
