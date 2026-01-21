"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, ArrowLeft, Loader2, Package } from "lucide-react";

interface Item {
    id: number;
    barcode: string;
    name: string | null;
    createdAt: string | Date;
    totalQuantity?: number;
    avgBuyingPrice?: number;
    avgSellingPrice?: number;
}

interface PaginationInfo {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

interface ApiResponse {
    data: Item[] | null;
    pagination?: PaginationInfo;
    error?: string;
}

export default function ItemsListClient() {
    const [items, setItems] = useState<Item[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(1); // Reset to first page on new search
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch items
    const fetchItems = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (debouncedSearch) params.set("search", debouncedSearch);
            params.set("page", String(currentPage));
            params.set("pageSize", "10");

            const res = await fetch(`/api/items?${params.toString()}`);
            const json: ApiResponse = await res.json();

            if (!res.ok || json.error) {
                setError(json.error || "Failed to fetch items");
                setItems([]);
                setPagination(null);
            } else {
                setItems(json.data || []);
                setPagination(json.pagination || null);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Network error");
            setItems([]);
            setPagination(null);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, currentPage]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    // Helper to format currency
    const formatCurrency = (value: number | undefined) => {
        if (value === undefined || value === 0) return "-";
        return `ETB ${value.toFixed(2)}`;
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        if (!pagination) return [];
        const { page, totalPages } = pagination;
        const pages: (number | "ellipsis")[] = [];

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (page > 3) pages.push("ellipsis");
            for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
                pages.push(i);
            }
            if (page < totalPages - 2) pages.push("ellipsis");
            if (totalPages > 1) pages.push(totalPages);
        }
        return pages;
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-50">
            <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h1 className="text-2xl font-semibold">All Items</h1>
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to scanner
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Search by name or barcode..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-slate-500"
                    />
                </div>

                {/* Error */}
                {error && (
                    <Card className="bg-red-950/50 border-red-800">
                        <CardContent className="py-3 text-sm text-red-400">{error}</CardContent>
                    </Card>
                )}

                {/* Loading */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                )}

                {/* Mobile Card View */}
                {!isLoading && items.length > 0 && (
                    <div className="block md:hidden space-y-3">
                        {items.map((item) => (
                            <Card key={item.id} className="bg-slate-900 border-slate-800">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-base text-slate-100">
                                                {item.name ?? "-"}
                                            </CardTitle>
                                            <p className="text-xs text-slate-400 font-mono mt-1">
                                                {item.barcode}
                                            </p>
                                        </div>
                                        <span className="px-2 py-1 rounded-full bg-slate-800 text-xs text-slate-300">
                                            Qty: {item.totalQuantity ?? 0}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wide">Cost</p>
                                            <p className="text-sm font-medium text-slate-200">
                                                {formatCurrency(item.avgBuyingPrice)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wide">Selling</p>
                                            <p className="text-sm font-medium text-emerald-400">
                                                {formatCurrency(item.avgSellingPrice)}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Desktop Table View */}
                {!isLoading && items.length > 0 && (
                    <Card className="hidden md:block bg-slate-900 border-slate-800">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-800 hover:bg-slate-800/40">
                                    <TableHead className="text-slate-300">Name</TableHead>
                                    <TableHead className="text-right text-slate-300">Quantity</TableHead>
                                    <TableHead className="text-right text-slate-300">Cost</TableHead>
                                    <TableHead className="text-right text-slate-300">Selling Price</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item) => (
                                    <TableRow key={item.id} className="border-slate-800 hover:bg-slate-800/40">
                                        <TableCell className="font-medium text-slate-100">
                                            {item.name ?? "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                                                {item.totalQuantity ?? 0}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right text-slate-300">
                                            {formatCurrency(item.avgBuyingPrice)}
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-emerald-400">
                                            {formatCurrency(item.avgSellingPrice)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                )}

                {/* Empty State */}
                {!isLoading && items.length === 0 && !error && (
                    <Card className="bg-slate-900 border-slate-800">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <Package className="w-12 h-12 mb-4 text-slate-600" />
                            <p>No items found.</p>
                            {debouncedSearch && (
                                <p className="text-sm mt-1">Try a different search term.</p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {!isLoading && pagination && pagination.totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-slate-400">
                            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
                            {Math.min(pagination.page * pagination.pageSize, pagination.totalItems)} of{" "}
                            {pagination.totalItems} items
                        </p>
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                                        }}
                                        className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                                {getPageNumbers().map((p, idx) =>
                                    p === "ellipsis" ? (
                                        <PaginationItem key={`ellipsis-${idx}`}>
                                            <span className="px-3 py-2 text-slate-500">...</span>
                                        </PaginationItem>
                                    ) : (
                                        <PaginationItem key={p}>
                                            <PaginationLink
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setCurrentPage(p);
                                                }}
                                                isActive={currentPage === p}
                                                className="cursor-pointer"
                                            >
                                                {p}
                                            </PaginationLink>
                                        </PaginationItem>
                                    )
                                )}
                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (currentPage < pagination.totalPages) setCurrentPage(currentPage + 1);
                                        }}
                                        className={
                                            currentPage >= pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                                        }
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>
        </main>
    );
}
