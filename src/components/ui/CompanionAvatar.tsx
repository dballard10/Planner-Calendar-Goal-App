import React from "react";
import { getInitials } from "../weekly/utils/name";
import Avatar from "./Avatar";

interface CompanionAvatarProps {
  name: string;
  color?: string;
  size: "sm" | "lg";
  className?: string;
}

/**
 * Specialized Avatar for Companions that ensures consistent styling
 * across TaskCards and the CompanionsPage.
 */
export default function CompanionAvatar({
  name,
  color,
  size,
  className = "",
}: CompanionAvatarProps) {
  const pixelSize = size === "sm" ? 20 : 56;

  return (
    <Avatar
      content={getInitials(name)}
      label={name}
      bgColor={color || "#64748b"}
      size={pixelSize}
      className={className}
    />
  );
}
