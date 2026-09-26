interface LoadingStateProps{
    message: string
}

export default function LoadingState({message}:LoadingStateProps)
{
    return(
        <h1 className="flex min-h-[70vh] flex-col items-center justify-center text-center">
            {message}
        </h1>
    )
}