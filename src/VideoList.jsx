import {useState, useEffect} from 'react';
import axios from 'axios';

function VideoList() {
    const [videos, setVideos] = useState([]);
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('No token found — user may not be logged in');
            return;
        }
        axios.get('http://localhost:8080/api/videos?page=0&size=10&sort=id,desc',{
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
    return (
        <div>
            <h2>Hello, Video List</h2>
            <ul>
                {videos.map((video) => (
                    <li key={video.id}>
                        {video.compilationName} (ID: {video.id})
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default VideoList;