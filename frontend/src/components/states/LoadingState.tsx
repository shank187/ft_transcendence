interface LoadingStateProps{
    message: string
    className?: string
}

export default function LoadingState({message, className=""}:LoadingStateProps)
{
    return(
        <h1 className="{flex min-h-[70vh] flex-col items-center justify-center text-center ${className}}">
            {message}
        </h1>
    )
}