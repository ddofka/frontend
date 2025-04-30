import React, { useState, useEffect } from 'react';
import './VideoList.css';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender
} from '@tanstack/react-table';
import EditVideoModal from './EditVideoModal.jsx';

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

function VideoList({ videoData = [], pageIndex = 0, pageSize = 10, setPageIndex, selectedIds = [], setSelectedIds, totalVideos = 0 }) {
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [pageCount, setPageCount] = useState(0);

    useEffect(() => {
        setPageCount(Math.ceil(totalVideos / pageSize));
    }, [totalVideos, pageSize]);

    const paginatedData = videoData.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

    const pagination = {
        pageIndex,
        pageSize,
    };
    const emptyRowsCount = Math.max(0, pageSize - paginatedData.length);
    const emptyRows = Array(emptyRowsCount).fill(null);

    const toggleVideoSelection = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((vid) => vid !== id) : [...prev, id]
        );
    };

    const table = useReactTable({
        data: paginatedData, columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {
            pagination,
        },
        pageCount: pageCount,
        manualPagination: true,
        onPaginationChange: ({ pageIndex: newPageIndex }) => setPageIndex(newPageIndex),
    });


    const highestItemOnPage = pageIndex * pageSize + paginatedData.length;
    const lowestItemOnPage = pageIndex * pageSize + 1;

    return (
        <>
        <div className="table-container">
        <table className="video-table table-content">
            <thead>
            <tr>
                <th></th>
                {table.getHeaderGroups().map(headerGroup => (
                    headerGroup.headers.map(header => (
                        <th key={header.id}
                            style={{ textAlign: header.column.columnDef.meta?.headerAlign || 'left' }}
                        >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                    ))
                ))}
            </tr>
            </thead>
            <tbody className="table-body">
                {table.getRowModel().rows.map(row => {
                    const editorName = row.original.editor?.name || "";
                    const rowClass = getEditorClass(editorName);

                    return (
                    <tr key={row.id} className={rowClass} onClick={() => setSelectedVideo(row.original)}>
                        <td onClick={(e) => e.stopPropagation()}>
                            <input
                                type="checkbox"
                                className="video-select-checkbox"
                                style={{ appearance: 'checkbox', WebkitAppearance: 'checkbox', MozAppearance: 'checkbox' }}
                                checked={!!selectedIds?.includes(row.original.id)}
                                onChange={() => toggleVideoSelection(row.original.id)}
                            />
                        </td>
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
                        <td colSpan={columns.length + 1}>&nbsp;</td>
                    </tr>
                ))}
            </tbody>
        </table>
            <div className="pagination-controls">
                <div className="pagination-info">
                    <p>Showing {lowestItemOnPage}–{highestItemOnPage} of {totalVideos}</p>
                </div>

                <div className="pagination-buttons">
                    <button onClick={() => setPageIndex(pageIndex - 1)} disabled={pageIndex <= 0}>
                        Previous
                    </button>
                    <span>
                      Page {pageIndex + 1} of {pageCount}
                    </span>
                    <button onClick={() => setPageIndex(pageIndex + 1)} disabled={pageIndex >= pageCount - 1}>
                        Next
                    </button>
                </div>
            </div>
            {selectedVideo && (
                <EditVideoModal
                    video={selectedVideo}
                    onClose={() => setSelectedVideo(null)}
                    onVideoUpdated={() => {}}
                />
            )}
        </div>
        </>
    );
}

export default VideoList;