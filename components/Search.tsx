import { useState } from "react";
import { Input } from "@/components/ui/input";

const suggestionsList: string[] = [
    "Next.js",
    "React.js",
    "Tailwind CSS",
    "Node.js",
    "MongoDB",
    "Express.js",
    "JavaScript",
    "TypeScript",
    "Redux",
    "GraphQL"
];

export default function Search() {
    const [query, setQuery] = useState<string>("");
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        if (value.length > 0) {
            const filtered = suggestionsList.filter((suggestion) =>
                suggestion.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSelect = (suggestion: string) => {
        setQuery(suggestion);
        setShowSuggestions(false);
    };

    return (
        <div className="relative w-64 mx-auto sm:block hidden">
            <Input
                type="text"
                value={query}
                onChange={handleChange}
                placeholder="Search Forms"
                className="w-full"
            />
            {showSuggestions && (
                <ul className="absolute left-0 right-0 bg-white dark:bg-black border rounded-md shadow-md mt-1 max-h-40 overflow-y-auto">
                    {filteredSuggestions.length > 0 ? (
                        filteredSuggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                onClick={() => handleSelect(suggestion)}
                                className="p-2 text-black dark:text-white hover:bg-gray-200 cursor-pointer"
                            >
                                {suggestion}
                            </li>
                        ))
                    ) : (
                        <li className="p-2 text-gray-500">No Forms found</li>
                    )}
                </ul>
            )
            }
        </div >
    );
}
