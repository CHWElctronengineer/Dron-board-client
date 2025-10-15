import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css'; // 이 컴포넌트에 적용될 CSS 스타일을 불러옵니다.

// API 요청의 기본 URL을 상수로 정의하여 관리의 용이성을 높입니다.
const API_BASE_URL = 'http://192.168.0.141:8084';

const locations = [1, 2, 3, 4, 5, 6];

const processes = [
    { id: 'PROC_CUT', name: '절단' },
    { id: 'PROC_PROC', name: '가공' },
    { id: 'PROC_ASSY', name: '조립' },
    { id: 'PROC_PAINT', name: '용접' },
    { id: 'PROC_LOAD', name: '도장' },
    { id: 'PROC_LAUNCH', name: '출하' },
];


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
  // 선택된 위치 ID를 저장하는 상태
  const [selectedLocationId, setSelectedLocationId] = useState('');
  // 선택된 공정 ID를 저장하는 상태
  const [selectedProcessId, setSelectedProcessId] = useState('');

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
   * '업로드' 버튼 클릭 시 선택된 파일과 데이터를 서버로 전송하는 함수입니다.
   */
  const handleUpload = async () => {
      if (!selectedFile) {
          alert('파일을 먼저 선택해주세요.');
          return;
      }

      // 위치가 선택되었는지 확인하는 유효성 검사를 추가합니다.
      if (!selectedLocationId) {
          alert('사진을 촬영한 위치를 선택해주세요.');
          return;
      }

      // 공정이 선택 되었는지 확인
      if (!selectedProcessId) {
            alert('사진이 촬영된 공정을 선택해주세요.');
            return;
        }

      setStatusMessage('업로드 중...');
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      // ✅ FormData에 processId와 locationId를 추가합니다.
      formData.append('processId', selectedProcessId);
      // locationId는 현재 UI에서 선택하지 않으므로, 고정된 값(1)을 보내줍니다.
      formData.append('locationId', 1);

      try {
          const response = await axios.post(`${API_BASE_URL}/api/images/upload`, formData);
          setStatusMessage(response.data);
          
          // ✅ 성공 시 모든 입력 상태 초기화
            setSelectedFile(null);
            setSelectedProcessId('');
            setSelectedLocationId('');
            document.querySelector('input[type="file"]').value = '';
          
          fetchPhotos();
      } catch (err) {
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
    <>
            <div className="container">
                <header>
                    <h1>📸 드론 사진 업로더</h1>
                </header>
                
                {/* 사진 업로드 섹션 */}
                <section className="card">
                    <h2>새 사진 업로드</h2>
                    <div className="upload-controls"> {/* 컨트롤들을 감싸는 컨테이너 */}
                        <input type="file" accept="image/*" onChange={handleFileChange} />
                        
                        {/* 위치 선택 (라디오 버튼) */}
                        <div className="radio-group">
                            <span>위치:</span>
                            {locations.map(loc => (
                                <label key={loc}>
                                    <input
                                        type="radio"
                                        name="location"
                                        value={loc}
                                        checked={selectedLocationId === String(loc)}
                                        onChange={(e) => setSelectedLocationId(e.target.value)}
                                    />
                                    {loc}
                                </label>
                            ))}
                        </div>

                        {/* 공정 선택 (드롭다운) */}
                        <select
                            value={selectedProcessId}
                            onChange={(e) => setSelectedProcessId(e.target.value)}
                        >
                            <option value="" disabled>-- 공정 선택 --</option>
                            {processes.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                        </select>
                        
                        <button 
                            onClick={handleUpload} 
                            disabled={!selectedFile || !selectedLocationId || !selectedProcessId}
                            className="upload-button"
                        >
                            업로드
                        </button>
                    </div>
                    {statusMessage && <p className="status-message">{statusMessage}</p>}
                </section>

                {/* 업로드된 사진 목록 섹션 (변경 없음) */}
                <section className="card">
                    <h2>업로드된 사진 목록</h2>
                    {photos.length === 0 ? (
                        <p>아직 업로드된 사진이 없습니다.</p>
                    ) : (
                        <div className="photo-grid">
                            {photos.map((photo) => (
                                <div 
                                    key={photo.id}
                                    className="photo-item"
                                    onClick={() => setSelectedImage(photo)}
                                >
                                    <img src={`${API_BASE_URL}/api/images/${photo.id}`} alt={photo.originalFilename} />
                                    <p title={photo.originalFilename}>{photo.originalFilename}</p>
                                    <button 
                                        className="delete-button" 
                                        onClick={(e) => {
                                            e.stopPropagation(); 
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

            {/* 이미지 상세 보기를 위한 모달 UI (변경 없음) */}
            {selectedImage && (
                <div className="modal-backdrop" onClick={() => setSelectedImage(null)}>
                    <img src={`${API_BASE_URL}/api/images/${selectedImage.id}`} alt={selectedImage.originalFilename} className="modal-content" onClick={(e) => e.stopPropagation()} />
                    <button className="modal-close-button" onClick={() => setSelectedImage(null)}>&times;</button>
                </div>
            )}
        </>
  );
}