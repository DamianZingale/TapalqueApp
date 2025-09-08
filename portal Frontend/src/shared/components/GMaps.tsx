import type { GMapsProps } from "../types/ui/ComercioProps"

export const GMaps: React.FC<GMapsProps> = ({ url }) => {
    return (
        <div className="rounded overflow-hidden shadow-sm my-3">
            <iframe
                src={url}
                width="100%"
                height="200 px"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
            />
        </div>
    )
}
