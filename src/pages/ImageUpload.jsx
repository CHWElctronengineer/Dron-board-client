import React, { useState } from 'react';
import axios from 'axios';

// 이미지를 '업로드'할 서버는 '드론 서버'(8084)입니다.  
const UPLOAD_API_URL = 'http://192.168.0.141:8084/api/images/upload';

export default function ImageUpload() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploadStatus, setUploadStatus] = useState(''); // 업로드 상태 메시지

    // 파일 선택 시 호출되는 함수
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setUploadStatus(''); // 이전 상태 메시지 초기화
            // 선택한 이미지 미리보기 생성
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // '업로드' 버튼 클릭 시 호출되는 함수
    const handleUpload = async () => {
        if (!selectedFile) {
            alert('먼저 파일을 선택해주세요.');
            return;
        }

        setUploadStatus('업로드 중...');
        const formData = new FormData();
        // 'file'이라는 키 값으로 선택된 파일을 담습니다.
        formData.append('file', selectedFile);

        try {
            const response = await axios.post(UPLOAD_API_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('업로드 성공:', response.data);
            setUploadStatus(`업로드 성공! (${response.data})`);
        } catch (error) {
            console.error('업로드 실패:', error);
            setUploadStatus('업로드 실패. 서버 로그를 확인해주세요.');
        }
    };

    return (
        <div className="p-8 max-w-xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">드론 이미지 업로드</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                {/* accept="image/*"는 이미지 파일만 선택하도록 유도합니다. */}
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />

                {/* 이미지 미리보기 */}
                {preview && (
                    <div className="mt-4 border p-2 rounded-md">
                        <img src={preview} alt="Preview" className="w-full h-auto rounded" />
                    </div>
                )}
                
                <button 
                    onClick={handleUpload} 
                    disabled={!selectedFile}
                    className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                    업로드
                </button>

                {/* 업로드 상태 메시지 */}
                {uploadStatus && (
                    <p className="mt-4 text-center text-gray-700">{uploadStatus}</p>
                )}
            </div>
        </div>
    );
}