import {useState, useEffect} from 'react';
import axios from 'axios';

function VideoList() {
    const [videos, setVideos] = useState([]);
    useEffect(() => {
        axios.get('http://localhost:8080/api/videos?page=0&size=10&sort=id,desc',{
            headers: {
                Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJyYW5kb20iLCJhdXRob3JpdGllcyI6WyJST0xFX01BTkFHRVIiXSwiaWF0IjoxNzQ0OTU1MTMzLCJleHAiOjE3NDQ5ODM5MzN9.21QS4mAAFhmYWZtp0NIaUo4FqMO4o7TBZyaaA0bU5KM`
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