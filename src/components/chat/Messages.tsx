import { trpc } from "@/app/_trpc/client"
import { INFINITE_QUERY_LIMIT } from "@/config/infinite_query"
import { keepPreviousData } from "@tanstack/react-query"
import { Span } from "next/dist/trace"

interface MessagesProps{
    fileId: string
}

const Messages = ({fileId}: MessagesProps) => {

    const {data, isLoading, fetchNextPage} = trpc.getFileMessages.useInfiniteQuery({
        fileId,
        limit: INFINITE_QUERY_LIMIT,
    },
    {
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
        keepPreviousData: true,
    })

    const messages = data?.pages.flatMap((page) => page.messages)

    const loadingMessage = {
        createdAt: new Date().toISOString(),
        id: 'loading-message',
        isUserMessage: false,
        text: {
            
        }
    }

    const combinedMessages = [
        ...(true ? [loadingMessage] : []),
        ...(messages ?? [])
    ]
    

    return <div className="flex max-h-[calc(100vh-3.5rem-7rem)] border-zinc-200 flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollerbar-track-blue-lighter scrollbar-w-2 scrolling-touch"></div>

}
export default Messages