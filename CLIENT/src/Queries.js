import axios from 'axios';

const GATEWAY_URL = 'http://localhost:4000'

export async function getMatrixDistance(mode, objLatLng){
    const body = `{
        "mode": "${mode}",
        "stgLatLng": ${JSON.stringify(objLatLng)}
    }`
    const response = await axios.post(`${GATEWAY_URL}/google/matrixdistance`, body, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*'
        }
    }).then(function (response) {
        //console.log(response.data);
        return response
    }).catch((err) => {
        return {
            status: "error",
            err: err
        }
    })
    //console.log(response);
    return response;
}
