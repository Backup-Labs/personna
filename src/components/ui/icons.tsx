import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown, faArrowRight, faArrowRightFromBracket, faArrowTrendUp, faBars, faBriefcase,
  faBook, faBookOpen, faBullseye, faCalendarDays, faChartLine, faCheck, faChevronDown,
  faChevronLeft, faChevronRight, faCircle, faCircleCheck, faCircleDot, faCircleExclamation, faCirclePause,
  faCirclePlay, faCircleUser, faClock, faCoins, faDatabase, faDownload, faFlag,
  faEye, faEyeSlash, faFolderOpen, faGear, faInbox, faKeyboard, faLightbulb, faListCheck, faLock,
  faEnvelope, faMagnifyingGlass, faMinus, faNoteSticky, faPause, faPlay, faPlus, faRotateLeft, faRobot, faMessage, faReceipt,
  faScaleBalanced, faShieldHalved, faSliders, faStar, faStopwatch, faSun, faTag,
  faTableColumns, faTriangleExclamation, faWallet, faWandMagicSparkles, faXmark,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { ComponentType } from "react";

export type IconProps = { size?: number; className?: string; strokeWidth?: number; fill?: string };
export type LucideIcon = ComponentType<IconProps>;
function icon(definition: IconDefinition): LucideIcon {
  return function AppIcon({ size = 16, className }: IconProps) {
    return <FontAwesomeIcon icon={definition} className={className} style={{ width: size, height: size }} aria-hidden="true" focusable="false" />;
  };
}

export const Activity = icon(faChartLine);
export const AlertTriangle = icon(faTriangleExclamation);
export const ArrowDownLeft = icon(faArrowDown);
export const ArrowDownToLine = icon(faDownload);
export const ArrowRight = icon(faArrowRight);
export const ArrowUpRight = icon(faArrowTrendUp);
export const ArrowDown = icon(faArrowDown);
export const Brain = icon(faLightbulb);
export const BriefcaseBusiness = icon(faBriefcase);
export const Bot = icon(faRobot);
export const MessageSquareText = icon(faMessage);
export const ReceiptText = icon(faReceipt);
export const Menu = icon(faBars);
export const X = icon(faXmark);
export const BookOpen = icon(faBookOpen);
export const CalendarClock = icon(faCalendarDays);
export const Check = icon(faCheck);
export const CheckCheck = icon(faListCheck);
export const ChevronDown = icon(faChevronDown);
export const ChevronLeft = icon(faChevronLeft);
export const ChevronRight = icon(faChevronRight);
export const Circle = icon(faCircle);
export const CircleAlert = icon(faCircleExclamation);
export const CircleCheck = icon(faCircleCheck);
export const CircleDashed = icon(faCircleDot);
export const CircleDollarSign = icon(faCoins);
export const CircleUserRound = icon(faCircleUser);
export const Clock3 = icon(faClock);
export const Command = icon(faKeyboard);
export const Database = icon(faDatabase);
export const Eye = icon(faEye);
export const EyeSlash = icon(faEyeSlash);
export const Envelope = icon(faEnvelope);
export const FileText = icon(faNoteSticky);
export const Flag = icon(faFlag);
export const FolderKanban = icon(faFolderOpen);
export const Goal = icon(faBullseye);
export const Inbox = icon(faInbox);
export const LayoutDashboard = icon(faTableColumns);
export const LibraryBig = icon(faBook);
export const Lightbulb = icon(faLightbulb);
export const ListTodo = icon(faListCheck);
export const LockKeyhole = icon(faLock);
export const LogOut = icon(faArrowRightFromBracket);
export const Minus = icon(faMinus);
export const NotebookPen = icon(faNoteSticky);
export const Pause = icon(faPause);
export const PauseCircle = icon(faCirclePause);
export const Play = icon(faPlay);
export const PlayCircle = icon(faCirclePlay);
export const Plus = icon(faPlus);
export const RotateCcw = icon(faRotateLeft);
export const Scale = icon(faScaleBalanced);
export const Search = icon(faMagnifyingGlass);
export const Settings2 = icon(faGear);
export const ShieldCheck = icon(faShieldHalved);
export const SlidersHorizontal = icon(faSliders);
export const Sparkles = icon(faWandMagicSparkles);
export const Star = icon(faStar);
export const Sun = icon(faSun);
export const Target = icon(faBullseye);
export const Tag = icon(faTag);
export const Timer = icon(faStopwatch);
export const Wallet = icon(faWallet);
