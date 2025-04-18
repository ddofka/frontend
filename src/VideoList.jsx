import { useState, useEffect } from 'react';
import axios from 'axios';
import './VideoList.css';

const editorColorMap = {};
let nextColorIndex = 0;
const colorClassCount = 5;

function VideoList() {
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('No token found — user may not be logged in');
            return;
        }
        axios.get('http://localhost:8080/api/videos?page=0&size=20&sort=id,desc',{
            headers: {
                Authorization: `Bearer ${token}`
            }
            })
            .then((response) => {
                console.log('API response:', response.data);
                setVideos(response.data.content);
            })
        .catch((error) => {
            console.error('Error fetching videos:', error);
        })
    },[])

    const getEditorClass = (name) => {
        if (!name) return 'editor-color-0';
        if (!(name in editorColorMap)) {
            editorColorMap[name] = nextColorIndex;
            nextColorIndex = (nextColorIndex + 1) % colorClassCount;
        }
        const classIndex = editorColorMap[name];
        return `editor-color-${classIndex}`;
    };

    return (
        <div>
            <h2>Hello, Video List</h2>
            <table>
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Stage</th>
                            <th>Priority</th>
                            <th>Compilation Name</th>
                            <th>Director</th>
                            <th>Editor</th>
                            <th>Filming Start</th>
                            <th>Edit Start</th>
                            <th>Post Date 1</th>
                            <th>Post Date 2</th>
                            <th>Post Date 3</th>
                            <th>Reference Link</th>
                            <th>Reference Title</th>
                        </tr>
                    </thead>

                    <tbody>
                        {videos.map((video) => {
                            const firstRelease = video.releases && video.releases.length > 0 ? video.releases[0] : null;
                            const secondRelease = video.releases && video.releases.length > 0 ? video.releases[1] : null;
                            const thirdRelease = video.releases && video.releases.length > 0 ? video.releases[2] : null;
                            return(
                        <tr key={video.id} className={getEditorClass(video.editor.name)}>
                            <td>{video.status}</td>
                            <td>{video.stage}</td>
                            <td>{video.priority}</td>
                            <td>{video.compilationName}</td>
                            <td>{video.director.name}</td>
                            <td>{video.editor.name}</td>
                            <td>{video.filmingStart}</td>
                            <td>{video.editStart}</td>
                            <td>{firstRelease && `"${firstRelease.releaseDateTime}"`}</td>
                            <td>{secondRelease && `"${secondRelease.releaseDateTime}"`}</td>
                            <td>{thirdRelease && `"${thirdRelease.releaseDateTime}"`}</td>
                            <td>{video.referenceLink}</td>
                            <td>{video.comment}</td>
                        </tr>
                        );
                        })}
                    </tbody>

            </table>
        </div>
    );
}

export default VideoList;