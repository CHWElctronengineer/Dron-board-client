import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css'; // 이 컴포넌트에 적용될 CSS 스타일을 불러옵니다.

// API 요청의 기본 URL을 상수로 정의하여 관리의 용이성을 높입니다.
const API_BASE_URL = 'http://192.168.0.141:8084';

// 드론 사진 업로드 및 조회를 위한 메인 애플리케이션 컴포넌트입니다.
export default function App() {
  // --- 상태(State) 정의 ---
  // 서버에서 불러온 사진 목록을 저장하는 상태입니다.
  const [photos, setPhotos] = useState([]);
  // 사용자가 업로드를 위해 선택한 파일 객체를 저장하는 상태입니다.
  const [selectedFile, setSelectedFile] = useState(null);
  // 업로드 상태나 오류 메시지를 사용자에게 보여주기 위한 상태입니다.
  const [statusMessage, setStatusMessage] = useState('');
  // 사용자가 클릭하여 상세히 볼 사진의 정보를 저장하는 상태입니다. (모달 제어용)
  const [selectedImage, setSelectedImage] = useState(null);

  /**
   * 서버로부터 모든 사진 목록을 비동기적으로 불러와 photos 상태를 업데이트하는 함수입니다.
   */
  const fetchPhotos = async () => {
    try {
      // API 서버에 GET 요청을 보내 사진 목록을 가져옵니다.
      const response = await axios.get(`${API_BASE_URL}/api/images`);
      // 요청 성공 시, 응답 데이터를 photos 상태에 저장합니다.
      setPhotos(response.data);
    } catch (err) {
      // 요청 실패 시, 콘솔에 에러를 출력하고 사용자에게 보여줄 메시지를 설정합니다.
      console.error("사진 목록 불러오기 실패", err);
      setStatusMessage('사진 목록을 불러올 수 없습니다. 서버 상태를 확인해주세요.');
    }
  };

  // React의 useEffect Hook: 컴포넌트가 처음 렌더링될 때 한 번만 실행됩니다.
  useEffect(() => {
    // 초기 사진 목록을 불러오기 위해 fetchPhotos 함수를 호출합니다.
    fetchPhotos();
  }, []); // 의존성 배열이 비어있으므로 최초 1회만 실행됩니다.

  /**
   * 파일 입력(input) 필드의 변경 이벤트를 처리하는 함수입니다.
   * 사용자가 파일을 선택하면 selectedFile 상태를 업데이트합니다.
   */
  const handleFileChange = (event) => {
    // 선택된 파일(files[0])을 selectedFile 상태에 저장합니다.
    setSelectedFile(event.target.files[0]);
    // 파일이 선택되면 기존 상태 메시지를 초기화합니다.
    setStatusMessage('');
  };

  /**
   * '업로드' 버튼 클릭 시 선택된 파일을 서버로 전송하는 함수입니다.
   */
  const handleUpload = async () => {
    // 선택된 파일이 없으면 사용자에게 알리고 함수를 종료합니다.
    if (!selectedFile) {
      alert('파일을 먼저 선택해주세요.');
      return;
    }
    // 사용자에게 업로드가 진행 중임을 알립니다.
    setStatusMessage('업로드 중...');
    
    // 파일 전송을 위해 FormData 객체를 생성합니다.
    const formData = new FormData();
    // 'file'이라는 키로 선택된 파일 데이터를 FormData에 추가합니다.
    formData.append('file', selectedFile);

    try {
      // API 서버에 POST 요청으로 파일 데이터를 전송합니다.
      const response = await axios.post(`${API_BASE_URL}/api/images/upload`, formData);
      // 업로드 성공 시, 서버로부터 받은 성공 메시지를 화면에 표시합니다.
      setStatusMessage(response.data);
      // 파일 선택 상태를 초기화합니다.
      setSelectedFile(null);
      // 파일 입력 필드의 값을 초기화하여 동일한 파일을 다시 선택할 수 있도록 합니다.
      document.querySelector('input[type="file"]').value = '';
      // 파일 목록을 새로고침하여 방금 업로드한 사진을 화면에 표시합니다.
      fetchPhotos();
    } catch (err) {
      // 업로드 실패 시, 콘솔에 에러를 기록하고 실패 메시지를 설정합니다.
      console.error("업로드 실패", err);
      setStatusMessage('업로드에 실패했습니다.');
    }
  };

  /**
   * 사진 ID를 받아 해당 사진을 서버에서 삭제하는 함수입니다.
   * @param {number} id - 삭제할 사진의 고유 ID
   */
  const handleDelete = async (id) => {
    // 사용자의 실수를 방지하기 위해 삭제 여부를 확인하는 대화상자를 띄웁니다.
    if (window.confirm(`정말로 이 사진(ID: ${id})을 삭제하시겠습니까?`)) {
      try {
        // API 서버에 DELETE 요청을 보내 특정 ID의 사진을 삭제합니다.
        await axios.delete(`${API_BASE_URL}/api/images/${id}`);
        alert('사진이 삭제되었습니다.');
        // 삭제 성공 후, 사진 목록을 새로고침하여 변경사항을 화면에 반영합니다.
        fetchPhotos();
      } catch (err) {
        // 삭제 실패 시, 콘솔에 에러를 기록하고 사용자에게 알립니다.
        console.error("삭제 실패", err);
        alert('사진 삭제에 실패했습니다.');
      }
    }
  };

  // 화면에 렌더링될 JSX를 반환합니다.
  return (
    // 최상위 요소로 React Fragment(<>)를 사용하여 모달과 메인 컨텐츠를 감쌉니다.
    <>
      <div className="container">
        <header>
          <h1>📸 드론 사진 업로더</h1>
        </header>
        
        {/* 사진 업로드 섹션 */}
        <section className="card">
          <h2>새 사진 업로드</h2>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <button onClick={handleUpload} disabled={!selectedFile}>
            업로드
          </button>
          {/* statusMessage가 있을 때만 메시지를 화면에 표시합니다. */}
          {statusMessage && <p className="status-message">{statusMessage}</p>}
        </section>

        {/* 업로드된 사진 목록 섹션 */}
        <section className="card">
          <h2>업로드된 사진 목록</h2>
          {/* photos 배열의 길이를 확인하여 사진 유무에 따라 다른 UI를 보여줍니다. */}
          {photos.length === 0 ? (
            <p>아직 업로드된 사진이 없습니다.</p>
          ) : (
            <div className="photo-grid">
              {/* photos 배열을 순회하며 각 사진 아이템을 렌더링합니다. */}
              {photos.map((photo) => (
                <div 
                  key={photo.id} // React가 각 요소를 식별하기 위한 고유 key
                  className="photo-item"
                  onClick={() => setSelectedImage(photo)} // 아이템 클릭 시 모달을 띄우기 위해 selectedImage 상태를 업데이트
                >
                  <img
                    src={`${API_BASE_URL}/api/images/${photo.id}`} // 이미지 소스 URL
                    alt={photo.originalFilename} // 이미지가 표시되지 않을 때의 대체 텍스트
                  />
                  <p title={photo.originalFilename}>{photo.originalFilename}</p>
                  
                  {/* 삭제 버튼 */}
                  <button 
                    className="delete-button" 
                    onClick={(e) => {
                      // 이벤트 버블링을 막아 부모 div의 onClick(모달 열기)이 실행되지 않도록 합니다.
                      e.stopPropagation(); 
                      handleDelete(photo.id); // 삭제 함수 호출
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

      {/* 이미지 상세 보기를 위한 모달 UI */}
      {/* selectedImage 상태에 값이 있을 때만 모달을 렌더링합니다. */}
      {selectedImage && (
        // 모달 배경. 클릭 시 모달을 닫습니다.
        <div className="modal-backdrop" onClick={() => setSelectedImage(null)}>
          <img
            src={`${API_BASE_URL}/api/images/${selectedImage.id}`}
            alt={selectedImage.originalFilename}
            className="modal-content"
            // 이미지 자체를 클릭했을 때는 모달이 닫히지 않도록 이벤트 전파를 막습니다.
            onClick={(e) => e.stopPropagation()} 
          />
          {/* 모달 닫기 버튼 */}
          <button 
            className="modal-close-button" 
            onClick={() => setSelectedImage(null)}
          >
            &times; {/* 'x' 모양의 HTML 특수문자 */}
          </button>
        </div>
      )}
    </>
  );
}