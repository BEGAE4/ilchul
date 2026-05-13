# 플랜-5. 플랜 좋아요순 조회
## URL : GET /api/plan/popular

### 본문 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |

### 응답

|  | **응답 본문** |
| --- | --- |
| 200 |  |
| 400 |  |

## 코드 예시

### 응답

```java
"planId": int,
"userNickname": String,
"planTitle": String,
"planVerified": Boolean,
"planDescription": String,
"createAt": DateTime,
"likeCount": int,
"planPlaceDtos":[
	{
	"planPlaceId": int,
	"stamped": true
	"planPlaceImageDtos":[
		"planPlaceImageId" : int,
		"planPlaceImageUrl" : String
	],
	}
]
```
# 플랜 좋아요
## URL : /api/like/{planId}

### 응답

```java
{
	"isLiked": true,
	"likeCount": 26
}
```

# 플랜 상세 조회
## URL : /api/plan/{planId}
### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 |

## 코드 예시

### 응답

```java
"planId": 1,
"planTitle": "서울 감성 카페투어",
"tripDate": "2024-12-27T09:00:00",
"createAt": "2024-12-19T19:00:00",
"isPlanVisible": true,
"planDescription": "강남부터 홍대까지 핫한 카페 탐방",
"planPlaceDetailDtos":[
{
"planPlaceId": 1,
"placeImage": "https://images.example.com/cafe1.jpg",
"placeName": "감성커피로스터리",
"address": "서울 강남구 삼성동 159",
"orderIndex": 1,
"isStamped": false
},
{
"planPlaceId": 2,
"placeImage": "https://images.example.com/art.jpg",
"placeName": "현대미술관 홍대",
"address": "서울 마포구 홍익로",
"orderIndex": 2,
"isStamped": true
}
]
```


# 플랜 저장 전 시간계산 및 프리뷰
## URL : /api/plan-place/duration
### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 |

## 코드 예시

### 요청

```jsx
{
    "planTitle" : "제목",
    "planDescription" : "설명",
    "isPlanVisible" : false,
    "places" : [
        {
            "placeId" : 300,
            "order" : 1
        },
        {
            "placeId" : 301,
            "order" : 2
        },
        {
            "placeId" : 302,
            "order" : 3
        },
        {
            "placeId" : 303,
            "order" : 4
        },
        {
            "placeId" : 304,
            "order" : 5
        }
    ]
}
```

### 응답

```java
{
    "planTitle": "제목",
    "planDescription": "설명",
    "isPlanVisible": false,
    "totalDuration": 480,
    "places": [
        {
            "placeId": 300,
            "placeName": "교보문고 잠실점",
            "roadAddressName": "서울 송파구 올림픽로 269",
            "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AL8-SNFtKPfzowdcx8ALb35GtQARwZjbY7Dr2vXeaoMmivjoqsYtBZXX_dPv1yX4Hc3zz9JnoXK27ydPTO_x3hthM3iidS7P3hEc_-FxWQbDBENC4sKXQCHZFnLPFIn2JJ0WorMKWIIYOSh3cy2E4A=s4800-w300-h300",
            "order": 1,
            "duration": 0
        },
        {
            "placeId": 301,
            "placeName": "교보문고 천호점",
            "roadAddressName": "서울 강동구 올림픽로 664",
            "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AL8-SNFsB-MX-nQ9zLCvk_-6c-CxCqzWOQtTbQHhNE4vTjHAQqm-dwmAKqkvUOF4r_me2M_KXccIGcBsorAMM61U9dNIqT62N9F-jsgUQX8Zw047gW6ImVEg250wUNoeOFsrGLwJ9rWMuI5xQjf3Zg=s4800-w300-h300",
            "order": 2,
            "duration": 18
        },
        {
            "placeId": 302,
            "placeName": "교보문고 동대문점",
            "roadAddressName": "서울 중구 장충단로13길 20",
            "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AL8-SNFR4zdKSVpYOC9yDNfOrdOhCe8Ml0dbAyC_npGr4U3w7Mun0kqE7t6lyNoeGeNouLXxG1LJDiI95IWGaySW3PVHg_Ae6uwJ0jrbyPJRcj4F-z2dybpK8lF-ztpPvYsP5olVZ23zEeeXZl4fvhk=s4800-w300-h300",
            "order": 3,
            "duration": 29
        },
        {
            "placeId": 303,
            "placeName": "교보문고 광주상무점",
            "roadAddressName": "광주 서구 상무중앙로 58",
            "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AL8-SNHR0JmjQUKMBgY-p2a-WSQJVwKUhvW5Ad25g3_MKxq-yUaCCH3Dd-dcmRzLwdZW4oAO2iRQ5DhBKFtNCOmfoXs2DyHpe6otgQr-_z6oLdlyNjXXdEomDcRrXJKMFg88aoWjmJ_cgJCJk1j8iJk=s4800-w300-h300",
            "order": 4,
            "duration": 219
        },
        {
            "placeId": 304,
            "placeName": "교보문고 일산점",
            "roadAddressName": "경기 고양시 일산동구 중앙로 1036",
            "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AL8-SNGIvzY9DRJl4wQ367yuCCk7-gdgtTXH5xa48xEFRTSfA580w5AlPKVuGRAV23GztwEdltyUnyreP_wAmKik9NsCzYU7cR9NienAIS5gXKP9tDXnSqF7KbJSpbVQ2FaV5vjyCsagnCDEyDOqxtM=s4800-w300-h300",
            "order": 5,
            "duration": 213
        }
    ]
}
```

# 플랜 스크랩 
## URL : /api/plan/scrapped/{planId}

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 |

## 코드 예시

### 응답

```java
{
	planId : 13
}
```

