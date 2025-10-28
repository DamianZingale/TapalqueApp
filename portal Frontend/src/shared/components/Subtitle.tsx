import type { TitleProps } from "../types/PropsGeneralesVerMas"

export const Subtitle: React.FC<TitleProps> = ({text}) => {
    return (
        <h3 className="">
            {text}
        </h3>
    )
}
