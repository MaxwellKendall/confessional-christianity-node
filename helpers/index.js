import axios from 'axios';

export const removeJsonExtension = new RegExp(/.json$/);

export const getConfessions = async () => {
    const { data } = await axios.get('http://localhost:3000/api/confessions');
    return data.confessions;
}