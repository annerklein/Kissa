export declare const RoastLevel: {
    readonly LIGHT: "LIGHT";
    readonly MEDIUM_LIGHT: "MEDIUM_LIGHT";
    readonly MEDIUM: "MEDIUM";
    readonly MEDIUM_DARK: "MEDIUM_DARK";
    readonly DARK: "DARK";
};
export type RoastLevel = (typeof RoastLevel)[keyof typeof RoastLevel];
export declare const BagStatus: {
    readonly UNOPENED: "UNOPENED";
    readonly OPEN: "OPEN";
    readonly FINISHED: "FINISHED";
};
export type BagStatus = (typeof BagStatus)[keyof typeof BagStatus];
export declare const DialStatus: {
    readonly DIALING_IN: "DIALING_IN";
    readonly STABLE: "STABLE";
};
export type DialStatus = (typeof DialStatus)[keyof typeof DialStatus];
export declare const MethodType: {
    readonly V60: "v60";
    readonly MOKA: "moka";
    readonly ESPRESSO: "espresso";
    readonly FRENCH_PRESS: "french_press";
};
export type MethodType = (typeof MethodType)[keyof typeof MethodType];
//# sourceMappingURL=enums.d.ts.map