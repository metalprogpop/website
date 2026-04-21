import logo from "../../../assets/images/logo-caras.png";

type LogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
};

const sizeClasses = {
  sm: "h-8",
  md: "h-12",
  lg: "h-16 sm:h-20",
  xl: "h-24 sm:h-32",
  hero: "h-48 sm:h-64 md:h-80 lg:h-96",
};

export function Logo({ className = "", size = "md" }: LogoProps) {
  return (
    <img
      src={logo}
      alt="MetalProgPop Cast"
      className={`${sizeClasses[size]} w-auto ${className}`}
    />
  );
}
