import * as Flags from 'country-flag-icons/react/3x2';
import React from 'react';

interface Props {
    code: string;
    className?: string;
}

const FLAG_COMPONENT_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    // Americas
    US: Flags.US,
    CA: Flags.CA,
    MX: Flags.MX,
    BR: Flags.BR,
    // Europe
    UK: Flags.GB, // Map UK to GB
    DE: Flags.DE,
    FR: Flags.FR,
    IT: Flags.IT,
    ES: Flags.ES,
    NL: Flags.NL,
    BE: Flags.BE,
    PL: Flags.PL,
    SE: Flags.SE,
    IR: Flags.IE, // Map IR to IE (Ireland)
    TR: Flags.TR,
    // Asia Pacific
    JP: Flags.JP,
    IN: Flags.IN,
    AU: Flags.AU,
    SG: Flags.SG,
    // Middle East
    AE: Flags.AE,
    SA: Flags.SA,
};

export function CountryFlag({ code, className }: Props) {
    const FlagComponent = FLAG_COMPONENT_MAP[code] || FLAG_COMPONENT_MAP[code.toUpperCase()];

    if (!FlagComponent) {
        return <span className={`font-mono font-bold ${className}`}>{code}</span>;
    }

    return <FlagComponent className={className} />;
}
