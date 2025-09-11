import { type LoadingProps } from "../types/LoadingProps"

export const Loading :React.FC<LoadingProps>= ({text}) => {
    return (
        <div className="d-flex flex-column align-items-center justify-content-center py-5 text-muted">
            <div className="spinner-border text-secundary mb-3" role="status" />
            <span>{text}</span>
        </div>
    )
}
