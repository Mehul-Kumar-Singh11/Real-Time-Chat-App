import { User } from "@/context/AppContext";
import { Menu, UserCircle } from "lucide-react";
import React from "react";

interface ChatHeaderProps {
    user: User | null;
    setSidebarOpen: (open: boolean) => void;
    isTyping: boolean;
}

const ChatHeader = ({
    user,
    setSidebarOpen,
    isTyping,
}: ChatHeaderProps) => {
    return (
        <>
            {/* mobile menu toggle */}
            <div className="sm:hidden fixed top-4 right-4 z-30">
                <button
                    className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                    onClick={() => setSidebarOpen(true)}
                >
                    <Menu className="w-5 h-5 text-gray-200" />
                </button>
            </div>

            {/* chat header */}
            <div className="mb-6 bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <div className="relative">
                                <div
                                    className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center
                "
                                >
                                    <UserCircle className="w-8 h-8 text-gray-300" />
                                </div>
                                {/* online user setup */}
                            </div>

                            {/* user info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h2 className="text-2xl font-bold text-white truncate">
                                        {user.name}
                                    </h2>
                                </div>

                                <div className="flex items-center gap-2">
                                    {isTyping ? (
                                        <div className="flex items-center gap-2 text-sm">
                                            <div className="flex gap-1">
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                                                <div
                                                    className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                                                    style={{ animationDelay: "0.1s" }}
                                                ></div>
                                                <div
                                                    className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                                                    style={{ animationDelay: "0.2s" }}
                                                ></div>
                                            </div>
                                            <span className="text-blue-500 font-medium">
                                                typing...
                                            </span>
                                        </div>
                                    ) : (
                                        <div> </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center">
                                <UserCircle className="w-8 h-8 text-gray-300" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-400">
                                    Select a conversation
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Choose a chat from the sidebar to start messaging
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ChatHeader;
