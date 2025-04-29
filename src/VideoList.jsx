import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosInstance';
import './VideoList.css';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender
} from '@tanstack/react-table';

const editorColorMap = {};
let nextColorIndex = 0;
const colorClassCount = 5;

const columns = [
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
            const status = getValue();
            if (!status) return <span className="tag">-</span>; // <- safe fallback
            return <span className={`tag tag-${status.toLowerCase()}`}>{status}</span>;
        },
        meta: {
            headerAlign: 'center',
            align: 'center'
        }
    },
    {
        accessorKey: 'stage',
        header: 'Stage',
        cell: ({ getValue }) => {
            const stage = getValue();
            if (!stage) return <span className="tag">-</span>;
            return <span className={`tag tag-${stage.toLowerCase()}`}>{stage}</span>;
        },
        meta: {
            headerAlign: 'center',
            align: 'center'
        }
    },
    {
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ getValue }) => {
            const priority = getValue();
            if (!priority) return <span className="tag">-</span>;
            return <span className={`tag tag-${priority.toLowerCase()}`}>{priority}</span>;
        },
        meta: {
            headerAlign: 'right',
            align: 'right'
        }
    },
    {
        accessorKey: 'compilationName',
        header: 'Compilation Name',
    },
    {
        accessorKey: 'director.name',
        header: 'Director',
        meta: {
            headerAlign: 'center',
            align: 'center'
        }
    },
    {
        accessorKey: 'editor.name',
        header: 'Editor',
        meta: {
            headerAlign: 'center',
            align: 'center'
        }
    },
    {
        accessorKey: 'filmingStart',
        header: 'Filming Start',
        meta: {
            headerAlign: 'center',
            align: 'center'
        }
    },
    {
        accessorKey: 'editStart',
        header: 'Edit Start',
        meta: {
            headerAlign: 'center',
            align: 'center'
        }
    },
    {
        header: 'Release #1',
        cell: ({ row }) => {
            const release = row.original.releases?.[0];
            return release ? formatDate(release.releaseDateTime) : '-';
        },
        meta: {
            headerAlign: 'center',
            align: 'center'
        }
    },
    {
        header: 'Release #2',
        cell: ({ row }) => {
            const release = row.original.releases?.[1];
            return release ? formatDate(release.releaseDateTime) : '-';
        },
        meta: {
            headerAlign: 'center',
            align: 'center'
        }
    },
    {
        header: 'Release #3',
        cell: ({ row }) => {
            const release = row.original.releases?.[2];
            return release ? formatDate(release.releaseDateTime) : '-';
        },
        meta: {
            headerAlign: 'center',
            align: 'center'
        }
    },
    {
        accessorKey: 'referenceLink',
        header: 'Reference',
        cell: ({ getValue }) => {
            const url = getValue();
            if (!url) return '-';

            return (
                <a href={url} target="_blank" rel="noopener noreferrer">
                    Watch
                </a>
            );
        },
        meta: {
            headerAlign: 'center',
            align: 'center'
        }
    },
    {
        accessorKey: 'comment',
        header: 'Reference Title'
    },
];

const getEditorClass = (name) => {
    if (!name) return 'editor-color';
    if (!(name in editorColorMap)) {
        editorColorMap[name] = nextColorIndex;
        nextColorIndex = (nextColorIndex + 1) % colorClassCount;
    }
    const classIndex = editorColorMap[name];
    return `editor-color-${classIndex}`;
};

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('lt-LT', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

function VideoTable({ refreshTrigger}) {
    const [videos, setVideos] = useState([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [pageCount, setPageCount] = useState(0);
    const [totalVideos, setTotalVideos] = useState(0);
    const emptyRowsCount = Math.max(0, pagination.pageSize - videos.length);
    const emptyRows = Array(emptyRowsCount).fill(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const { pageIndex, pageSize } = pagination;

        if (!token) return;

        axiosInstance.get(`http://localhost:8080/api/videos?page=${pageIndex}&size=${pageSize}&sort=id,desc`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then((response) => {
                setVideos(response.data.content);
                setPageCount(response.data.page.totalPages)
                setTotalVideos(response.data.page.totalElements);
            })
    }, [pagination, refreshTrigger]);

    const table = useReactTable({
        data: videos, columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {
            pagination,
        },
        pageCount,
        manualPagination: true,
        onPaginationChange: setPagination,
    });

    const currentPage = pagination.pageIndex;
    const itemsPerPage = pagination.pageSize;

    const highestItemOnPage = totalVideos - (currentPage * itemsPerPage);
    const lowestItemOnPage = Math.max(1, highestItemOnPage - videos.length + 1);

    return (
        <>
        <div className="table-container">
        <table className="table-content">
            <thead>
            {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                        <th key={header.id}
                            style={{ textAlign: header.column.columnDef.meta?.headerAlign || 'left' }}
                        >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                    ))}
                </tr>
            ))}
            </thead>
            <tbody className="table-body">
                {table.getRowModel().rows.map(row => {
                    const editorName = row.original.editor?.name || "";
                    const rowClass = getEditorClass(editorName);

                    return (
                    <tr key={row.id} className={rowClass}>
                {row.getVisibleCells().map(cell => (
                    <td
                        key={cell.id}
                        style={{ textAlign: cell.column.columnDef.meta?.align || 'left',
                            textTransform: cell.column.id === 'compilationName' ? 'uppercase' : undefined }}
                    >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                ))}
                </tr>
                );
                })}
                {emptyRows.map((_, index) => (
                    <tr key={`empty-row-${index}`} className="empty-row">
                        <td colSpan={columns.length}>&nbsp;</td>
                    </tr>
                ))}
            </tbody>
        </table>
            <div className="pagination-controls">
                <div className="pagination-info">
                    <p>Showing {highestItemOnPage}–{lowestItemOnPage} of {totalVideos}</p>
                </div>

                <div className="pagination-buttons">
                    <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                        Previous
                    </button>
                    <span>
                      Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </span>
                    <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                        Next
                    </button>
                </div>
            </div>
        </div>
        </>
    );
}
export default VideoTable;