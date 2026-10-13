import { LinkPreset, type NavBarLink } from "@/types/config";

export const LinkPresets: { [key in LinkPreset]: NavBarLink } = {
	[LinkPreset.Home]: {
		name: "主页",
		url: "/",
	},
	[LinkPreset.Moments]: {
		name: "碎碎念",
		url: "/moments/",
	},
	[LinkPreset.About]: {
		name: "关于",
		url: "/about/",
	},
	[LinkPreset.Archive]: {
		name: "归档",
		url: "/archive/",
	},
};
