import React, { useState } from 'react';
import { User } from "@/context/AppContext";
import { MessageCircle, X } from 'lucide-react';

interface ChatSidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    showAllUsers: boolean;
    setShowAllUsers: (show: boolean | ((prev: boolean) => boolean)) => void;
    users: User[] | null;
    loggedInUser: User | null;
    chats: any[] | null;
    selectedUser: string | null;
    setSelectedUser: (userId: string | null) => void
    handleLoutout: () => void;
}

const ChatSideBar = ({ sidebarOpen, setSidebarOpen, showAllUsers, setShowAllUsers, users,
    loggedInUser, chats, selectedUser, setSelectedUser, handleLoutout
}: ChatSidebarProps) => {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <aside
            className={`fixed z-20 sm:static top-0 left-0 h-screen w-80 bg-gray-900
        border-r border-gray-700 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                } sm:translate-x-0 transition-transform duration-300 flex flex-col`}
        >
            <div className='p-6 border-b border-gray-700'>
                <div className='sm:hidden flex justify-end mb-0'>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-300" />
                    </button>
                </div>


                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 justify-between">
                            <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>
            </div >

        </aside >
    )
}

export default ChatSideBar;