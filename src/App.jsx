import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css'; // 스타일을 위해 import

// 드론 서버의 주소입니다.
const API_BASE_URL = 'http://192.168.0.141:8084';

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  // 사용자가 클릭한 사진 정보를 저장할 상태
  const [selectedImage, setSelectedImage] = useState(null);

  // 사진 목록을 불러오는 함수
  const fetchPhotos = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/images`);
      setPhotos(response.data);
    } catch (err) {
      console.error("사진 목록 불러오기 실패", err);
      setStatusMessage('사진 목록을 불러올 수 없습니다. 서버 상태를 확인해주세요.');
    }
  };

  // 컴포넌트가 처음 로드될 때 사진 목록을 불러옵니다.
  useEffect(() => {
    fetchPhotos();
  }, []);

  // 파일 선택을 처리하는 함수
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setStatusMessage(''); // 메시지 초기화
  };

  // 파일 업로드를 처리하는 함수
  const handleUpload = async () => {
    if (!selectedFile) {
      alert('파일을 먼저 선택해주세요.');
      return;
    }
    setStatusMessage('업로드 중...');
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/images/upload`, formData);
      setStatusMessage(response.data); // 서버의 성공 메시지를 표시
      setSelectedFile(null); // 파일 선택 초기화
      document.querySelector('input[type="file"]').value = ''; // input 값 초기화
      fetchPhotos(); // 업로드 성공 후 목록을 새로고침
    } catch (err) {
      console.error("업로드 실패", err);
      setStatusMessage('업로드에 실패했습니다.');
    }
  };

  // ✅ [추가] 삭제 버튼 클릭을 처리하는 함수
  const handleDelete = async (id) => {
    // 실수로 삭제하는 것을 방지하기 위해 사용자에게 확인을 받습니다.
    if (window.confirm(`정말로 이 사진(ID: ${id})을 삭제하시겠습니까?`)) {
      try {
        await axios.delete(`${API_BASE_URL}/api/images/${id}`);
        alert('사진이 삭제되었습니다.');
        // 삭제 성공 후, 사진 목록을 새로고침하여 화면에 반영합니다.
        fetchPhotos();
      } catch (err) {
        console.error("삭제 실패", err);
        alert('사진 삭제에 실패했습니다.');
      }
    }
  };

  return (
  <> {/* 모달을 추가하기 위해 최상위 태그를 Fragment(<>)로 감싸줍니다. */}
    <div className="container">
      <header>
        <h1>📸 드론 사진 업로더</h1>
      </header>
      
      <section className="card">
        <h2>새 사진 업로드</h2>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={!selectedFile}>
          업로드
        </button>
        {statusMessage && <p className="status-message">{statusMessage}</p>}
      </section>

      <section className="card">
        <h2>업로드된 사진 목록</h2>
        {photos.length === 0 ? (
          <p>아직 업로드된 사진이 없습니다.</p>
        ) : (
          <div className="photo-grid">
            {photos.map((photo) => (
              // ✅ [수정] 사진 아이템 클릭 시 모달이 열리도록 onClick 이벤트 추가
              <div 
                key={photo.id} 
                className="photo-item"
                onClick={() => setSelectedImage(photo)}
              >
                <img
                  src={`${API_BASE_URL}/api/images/${photo.id}`}
                  alt={photo.originalFilename}
                />
                <p title={photo.originalFilename}>{photo.originalFilename}</p>
                {/* ✅ [수정] 삭제 버튼 클릭 시 모달이 열리지 않도록
                  e.stopPropagation() 코드를 추가합니다.
                */}
                <button 
                  className="delete-button" 
                  onClick={(e) => {
                    e.stopPropagation(); // 이벤트 버블링 방지
                    handleDelete(photo.id);
                  }}
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>

    {/* ✅ [추가] 이미지 상세 보기를 위한 모달 UI */}
    {selectedImage && (
      <div className="modal-backdrop" onClick={() => setSelectedImage(null)}>
        <img
          src={`${API_BASE_URL}/api/images/${selectedImage.id}`}
          alt={selectedImage.originalFilename}
          className="modal-content"
          onClick={(e) => e.stopPropagation()} // 이미지를 클릭해도 모달이 닫히지 않도록 함
        />
        <button 
          className="modal-close-button" 
          onClick={() => setSelectedImage(null)}
        >
          &times; {/* 'x' 모양 문자 */}
        </button>
      </div>
    )}
  </>
);
}