import type { SVGProps } from "react";

export function greetingForHour(hour: number) {
  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

export function pageLabelFromUrl(value: string | null) {
  if (!value) {
    return "/";
  }

  try {
    const url = new URL(value);
    return url.pathname || "/";
  } catch (error) {
    return value;
  }
}

function IconWrapper(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  );
}

export function ChatBubbleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="M7 18.5L3.5 20l1.5-3.5V6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v6A2.5 2.5 0 0 1 16.5 15h-9" />
      <path d="M8 8h8" />
      <path d="M8 11h5" />
    </IconWrapper>
  );
}

export function HouseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="M4 10.5L12 4l8 6.5" />
      <path d="M6.5 9.5V20h11V9.5" />
      <path d="M10 20v-5h4v5" />
    </IconWrapper>
  );
}

export function InboxIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5z" />
      <path d="M4 13h4l2 3h4l2-3h4" />
    </IconWrapper>
  );
}

export function PeopleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="M15.5 20v-1.5A3.5 3.5 0 0 0 12 15h-1A3.5 3.5 0 0 0 7.5 18.5V20" />
      <path d="M11.5 11A3 3 0 1 0 11.5 5a3 3 0 0 0 0 6Z" />
      <path d="M18.5 20v-1a3 3 0 0 0-2-2.83" />
      <path d="M16.5 5.5a2.5 2.5 0 0 1 0 5" />
    </IconWrapper>
  );
}

export function BarChartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="M4 19.5h16" />
      <path d="M7 16V9" />
      <path d="M12 16V5" />
      <path d="M17 16v-3" />
    </IconWrapper>
  );
}

export function RefreshIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="M20 11a8 8 0 0 0-14.9-3" />
      <path d="M4 4v4h4" />
      <path d="M4 13a8 8 0 0 0 14.9 3" />
      <path d="M20 20v-4h-4" />
    </IconWrapper>
  );
}

export function DownloadIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="M12 4v10" />
      <path d="m8.5 10.5 3.5 3.5 3.5-3.5" />
      <path d="M4 19.5h16" />
    </IconWrapper>
  );
}

export function MapPinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="M12 20s6-4.8 6-10a6 6 0 1 0-12 0c0 5.2 6 10 6 10Z" />
      <circle cx="12" cy="10" r="2.5" />
    </IconWrapper>
  );
}

export function GlobeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.5 2.3 4 5.2 4 8.5s-1.5 6.2-4 8.5c-2.5-2.3-4-5.2-4-8.5s1.5-6.2 4-8.5Z" />
    </IconWrapper>
  );
}

export function ExternalLinkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="M10 6.5H7.5A2.5 2.5 0 0 0 5 9v7.5A2.5 2.5 0 0 0 7.5 19h7.5a2.5 2.5 0 0 0 2.5-2.5V14" />
      <path d="M13 6h5v5" />
      <path d="m11 13 7-7" />
    </IconWrapper>
  );
}

export function EyeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </IconWrapper>
  );
}

export function FilterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </IconWrapper>
  );
}

export function SlidersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="M4 6h8" />
      <path d="M16 6h4" />
      <path d="M10 12h10" />
      <path d="M4 12h2" />
      <path d="M4 18h12" />
      <path d="M20 18h0" />
      <circle cx="14" cy="6" r="2" />
      <circle cx="8" cy="12" r="2" />
      <circle cx="18" cy="18" r="2" />
    </IconWrapper>
  );
}

export function CalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="M7 3.5v3" />
      <path d="M17 3.5v3" />
      <rect x="4" y="5.5" width="16" height="14" rx="2.5" />
      <path d="M4 9.5h16" />
    </IconWrapper>
  );
}

export function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="m6 9 6 6 6-6" />
    </IconWrapper>
  );
}

export function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="m15 6-6 6 6 6" />
    </IconWrapper>
  );
}

export function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="m9 6 6 6-6 6" />
    </IconWrapper>
  );
}

export function PaintbrushIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="M14 4.5a3.5 3.5 0 1 1 5 5L10 18.5H5v-5z" />
      <path d="M4.5 19.5c0-1.7 1.3-3 3-3h1v1c0 1.7-1.3 3-3 3h-1z" />
    </IconWrapper>
  );
}

export function UsersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="M16 20v-1.5A3.5 3.5 0 0 0 12.5 15h-2A3.5 3.5 0 0 0 7 18.5V20" />
      <path d="M11.5 11A3.5 3.5 0 1 0 11.5 4a3.5 3.5 0 0 0 0 7Z" />
      <path d="M18.5 8.5A2.5 2.5 0 0 1 16 11" />
      <path d="M19.5 20v-1a3 3 0 0 0-2.5-2.95" />
    </IconWrapper>
  );
}

export function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </IconWrapper>
  );
}

export function GearIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 1 0 12 8.5Z" />
      <path d="M19 12a7.3 7.3 0 0 0-.08-1l2.03-1.58-2-3.46-2.47 1a7.8 7.8 0 0 0-1.73-1L12.4 3h-4.8L7.25 5.96a7.8 7.8 0 0 0-1.73 1l-2.47-1-2 3.46L3.08 11a7.3 7.3 0 0 0 0 2l-2.03 1.58 2 3.46 2.47-1a7.8 7.8 0 0 0 1.73 1L7.6 21h4.8l.35-2.96a7.8 7.8 0 0 0 1.73-1l2.47 1 2-3.46L18.92 13c.05-.33.08-.66.08-1Z" />
    </IconWrapper>
  );
}

export function BellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="M6.5 16.5h11l-1.2-1.8c-.4-.6-.6-1.3-.6-2V10a3.7 3.7 0 1 0-7.4 0v2.7c0 .7-.2 1.4-.6 2z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </IconWrapper>
  );
}

export function MailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="m4.5 7 7.5 5.5L19.5 7" />
    </IconWrapper>
  );
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </IconWrapper>
  );
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="m5 12 4.5 4.5L19 7" />
    </IconWrapper>
  );
}

export function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="m12 4 2.4 4.86 5.36.78-3.88 3.79.92 5.35L12 16.25 7.2 18.78l.92-5.35-3.88-3.79 5.36-.78Z" />
    </IconWrapper>
  );
}

export function CreditCardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="M3.5 10h17" />
      <path d="M7 15h3" />
    </IconWrapper>
  );
}

export function DotsHorizontalIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <circle cx="6" cy="12" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.25" fill="currentColor" stroke="none" />
    </IconWrapper>
  );
}

export function DotsVerticalIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <circle cx="12" cy="6" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="12" cy="18" r="1.25" fill="currentColor" stroke="none" />
    </IconWrapper>
  );
}

export function CodeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="m8 8-4 4 4 4" />
      <path d="m16 8 4 4-4 4" />
      <path d="m13.5 5-3 14" />
    </IconWrapper>
  );
}

export function PaperclipIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49l9.2-9.19a4 4 0 0 1 5.65 5.66l-9.2 9.19a2 2 0 1 1-2.82-2.83l8.48-8.48" />
    </IconWrapper>
  );
}

export function SmileIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9 10h.01" />
      <path d="M15 10h.01" />
      <path d="M8.5 14a4.5 4.5 0 0 0 7 0" />
    </IconWrapper>
  );
}

export function WarningIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="M12 4.5 20 19H4z" />
      <path d="M12 9v4" />
      <path d="M12 16h.01" />
    </IconWrapper>
  );
}

export function ArrowLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="M19 12H5" />
      <path d="m12 5-7 7 7 7" />
    </IconWrapper>
  );
}

export function InfoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 10v5" />
      <path d="M12 7.5h.01" />
    </IconWrapper>
  );
}

export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="M6 6 18 18" />
      <path d="M18 6 6 18" />
    </IconWrapper>
  );
}

export function LaptopIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <rect x="4" y="5" width="16" height="11" rx="2" />
      <path d="M2.5 19h19" />
    </IconWrapper>
  );
}

export function PhoneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <rect x="7" y="3" width="10" height="18" rx="2.5" />
      <path d="M11 6h2" />
      <path d="M11 18h2" />
    </IconWrapper>
  );
}

export function CopyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <rect x="9" y="9" width="10" height="10" rx="2" />
      <path d="M15 9V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    </IconWrapper>
  );
}

export function CheckCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12 2.25 2.25L15.5 9.5" />
    </IconWrapper>
  );
}

export function CameraIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h2l1.5-2h4L15.5 6h2A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z" />
      <circle cx="12" cy="12.5" r="3.5" />
    </IconWrapper>
  );
}

export function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </IconWrapper>
  );
}

export function PencilIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="M14 5.5a2.1 2.1 0 0 1 3 3L8 17.5 4 18.5l1-4z" />
      <path d="M12.5 7 16 10.5" />
    </IconWrapper>
  );
}

export function TrashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="M4.5 7h15" />
      <path d="M9.5 7V4.5h5V7" />
      <path d="M7 7l.8 11.5A2 2 0 0 0 9.8 20h4.4a2 2 0 0 0 2-1.5L17 7" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </IconWrapper>
  );
}

export function LogoutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper {...props}>
      <path d="M14 7V5.5A2.5 2.5 0 0 0 11.5 3h-5A2.5 2.5 0 0 0 4 5.5v13A2.5 2.5 0 0 0 6.5 21h5a2.5 2.5 0 0 0 2.5-2.5V17" />
      <path d="M10 12h10" />
      <path d="M17 8.5 20.5 12 17 15.5" />
    </IconWrapper>
  );
}
