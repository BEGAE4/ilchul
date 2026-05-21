# PLACE-4. 장소 검색
## URL : GET /api/place/search?keyword={keyword}
### 본문 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| keyword | query parameter | O | 검색할 키워드 |

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 |

## 코드 예시

### 요청

```jsx
{
	get 요청 url 예시 -> http://localhost:8080/api/place/search?keyword=강남역근처초밥
}
```

### 응답

```java
[
    {
        "placeId": 374,
        "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AL8-SNFLyOU3lVoGtJL5uy1KpKdFjfahKnue_ZXRNbJKVpM5YS0-WA7zln25TX9MIAKsSU9fIWHa8v2WNRKhyCpXGU87jcyrbaoGWYPGkzVk7AwcgYGzyYPXvEJuri9VqpKPVy6jM6P5hK3Iy-JjOw=s4800-w300-h300",
        "categoryName": "음식점 · 일식",
        "placeName": "갓덴스시 강남점"
    },
    {
        "placeId": 375,
        "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AL8-SNHATBqvRsz-bHzq8wXhLzoOqDVwfSg2T-r3raHsPVZkvq4YDwCVxjkWYNTTPCNHJOVROKarS-ad7Z8gWRCiC-KByQ-164TVm4xDCCAo8XxfWMVWgq82ARJuhon8WGxTlbrlv2IXaj1b1MovVg=s4800-w300-h300",
        "categoryName": "음식점 · 일식",
        "placeName": "고메스시"
    },
    {
        "placeId": 381,
        "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AL8-SNFzNIftM5L5Vx0Nsq1bEFuk_MxZCh1rxKeT66mrFkqhDmIE2BOt1jMA--cr4rqvO9nIhUzc5yBlrr058Q-QJAqbeav2-L-F7lxl6ZtkLaOKaqj2A4b4UvTAarlXOiplnSkgrCvl-P6kDz8Ex-5NRNWkIw=s4800-w300-h300",
        "categoryName": "음식점 · 일식",
        "placeName": "은행골 강남역점"
    },
    {
        "placeId": 378,
        "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AL8-SNEh02PFOHzXY9ZmFZH6PsWKkN51BoRiFmsLUBRP1NcioRqRWjsrdUcnDS3o7LQqFMVOxlP7V28f7TCCJEvGedh9odkmT-mSZ7Onx5VCEWxtQl-RmvNOZVa8NsaYfyuKSM7raaF1X7QAxYsT8A=s4800-w300-h300",
        "categoryName": "음식점 · 일식",
        "placeName": "스시이안앤 강남역점"
    },
    {
        "placeId": 379,
        "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AL8-SNHg2JwRH_bb9FCCv0fOsfq0VFMZVulvmvB-08uizMPL6GtkbmbEZQVnNKzpUmCkej0rUAer-bFvNKye3Gui7fmmGgr0XLymjh9DmDqujZqAuew3jnqLXX9OGbTWxtXP-UsL5YM8W6eh0ayquVGn9nT0iA=s4800-w300-h300",
        "categoryName": "음식점 · 일식",
        "placeName": "오마카세 오사이초밥 강남역점"
    },
    {
        "placeId": 383,
        "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AL8-SNET-0_LPlbU_Ntt1pHLxhjq2BJpllLm_0MxEqbDf1u5Naefs1f6LhftGBtk1zn5pCvnEbVhRyXll7zN-sd1ghEC9SZEbwfonDExIQl_uMFNju050ydann4LNjgTPYHU1OgI5MKjqp4KjBz5R0Q=s4800-w300-h300",
        "categoryName": "음식점 · 일식",
        "placeName": "우리동네스시신조 강남점"
    },
    {
        "placeId": 389,
        "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AL8-SNGU198t11Fju94XkPiON2DgolclQyq_VH5bJgfuSbj4t1BL0BciqF_QZuVjGU_ZW_d6UjYPGTzdkwIL3sl9en_nPSk3oQ4XYhIcB-V0G6e1GAt-uZZvKvdPcNVLQgJMsPszfE6hPuF9siYO=s4800-w300-h300",
        "categoryName": "음식점 · 일식",
        "placeName": "도키메이테"
    },
    {
        "placeId": 380,
        "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AL8-SNEYDTTmKlpSXFzxc3ieafJUGE9ylJsHScfeytsMqXka5GcHrFroPPDi5jbqC6XyTJxcjb208KIRudimsl5imsN0dJIyAymSQDJ_fVpqC7M46_99ceOzpaJo1_IbjzRA0jcKb2UGlJrIADzXQw=s4800-w300-h300",
        "categoryName": "음식점 · 일식",
        "placeName": "스시마이우 강남CGV점"
    },
    {
        "placeId": 384,
        "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AL8-SNFFgOR7MdCbJb9-UbTkQjzOCkJmiOkW66-SsZSSdxbMhWib7AhYAVsuGHjvT8lb3iwBLE2n3Y5ank2BJ92B11YuEzsjJcRJ3tCaJTfDe1cZzgFoandCHYVQBjYfLZ7-nxc61qQL9H4OV9-5Ug=s4800-w300-h300",
        "categoryName": "음식점 · 일식",
        "placeName": "구레스시"
    },
    {
        "placeId": 385,
        "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AL8-SNHK4cPFKfsrIc8EkNSvzPDGz1MlUbAXJ0BgIHWWsK72Qftxn0OMFXiU32B7umIwHNygzZ_Vxg3cyUh12oYMhgzikX07DMVZ_R76yfuwOiwfknFrDPssn9karID3KKDD1si0OFebGTe6xCJevJA=s4800-w300-h300",
        "categoryName": "음식점 · 일식",
        "placeName": "스시도온"
    },
    {
        "placeId": 377,
        "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AL8-SNGjj6w3DP2sVhiiswCleIDJxRQIcwxGS1hx4wcdVuVQssffxJAk5UHL0ZvRcS98myjpG4vHCvg5dXgEEzrZKZR1OwCKPNw4WjNylARcfyq1WWC-IkSP8wBYYhgth10v7NV11Rg2ggJyThn2=s4800-w300-h300",
        "categoryName": "음식점 · 일식",
        "placeName": "하루스시"
    },
    {
        "placeId": 376,
        "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AL8-SNE8nN4d8dxFGg-xPCABENHap0zqEBghX0nOK4pdw-cKdoEEs3T33ET5YTv-dqIGIankIkguxTQV0xAsnY9EDewns_9UqW8WkT0EKd_nBqa_ycBFwpxQJS5JhbHP667nm0xLZcF5xqy2Z6bVSQ=s4800-w300-h300",
        "categoryName": "음식점 · 일식",
        "placeName": "스시려프리미엄"
    },
    {
        "placeId": 390,
        "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AL8-SNEFNDYzNQYOJuHv0PQD2N4GwLdUIC3eJrOrPjC5ZwL5d8znGLhYAIqtSXeaXraqn9rYAdl7CbGLMFvmJJFbMnuEvvFBsnlla6uAfO_Hh3dJCP7Xww2Da3S8FOooaBqf85fo5SwvzxJDD7nisOE=s4800-w300-h300",
        "categoryName": "음식점 · 일식",
        "placeName": "아트스시"
    },
    {
        "placeId": 391,
        "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AL8-SNF_AQL6TBAgeNgvHqm5bi0kgLW-fu972LxyMYN2RxOaWHj80zp-L7QkSTnhhCYDvcbihyeVtiqfGfP4aZtL7Jn94akdmUCMT-Gs9K4F2W4H8NvUsT81WztOGUdmuPTNnRBzufev2RvgaYysUcA=s4800-w300-h300",
        "categoryName": "음식점 · 일식",
        "placeName": "스시류블랙 강남N타워점"
    },
    {
        "placeId": 392,
        "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AL8-SNESxUWRVV36z0Rylc1vyYX7PtaVcYZkoiMmgVEJ6kztW7fdiIM5XdHozq4quPAibPVaHtU6Qts030Vu4iUODIKFYTObEmZ5wA1MYbrnVwQ6VVjwkOkndHq5m0o1XveyCSGTxMzQiSHltEG7yg=s4800-w300-h300",
        "categoryName": "음식점 · 일식",
        "placeName": "스시츠루"
    }
]
```



# PLACE-16. 설문 바탕 장소 추천
## URL : POST /api/place/recommend
### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 |

## 코드 예시

### 요청

```jsx
{
    "emotion" : "우울함",
    "startTime" : "2026-04-18 15:00",
    "endTime" : "2026-04-18 22:00",
    "transport" : "도보",
    "location" : {
        "x" : 128.898981,
        "y" : 37.760152
    }
}
```

### 응답

```json
[
    {
        "keyword": "카페",
        "radiusM": 1500,
        "places": [
            {
                "placeId": 165,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZOUNImXnyJoKnJQB46MWePn1dECKq3cyghKEEEkRyYaYLuMaGzBxxry7ju9zidtn3fzdqn-jHpInq-CtSbb4at8c0iOPANeTuIMZxlOQ-1ngGKD0E-yqHTfQC-qmwhGLkZevGRc5KzekybJxqw=s4800-w300-h300",
                "categoryName": "음식점 · 카페",
                "placeName": "알뜨",
                "x": 128.899802252991,
                "y": 37.7631911006287
            },
            {
                "placeId": 163,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZMorvHU89ToMAj1Li8XoPG6J-EZJZIeYsUEGOSWL7IIeC6nJIB1uI6QPa7ieFoXv91ScXyuQSvcJ3D8nzEJPFztveUYzqjfAcQZFgqWRhIlRdFr0kF_PXRDQSJ0cKCiycTC-kVWkjeNaXDVtA=s4800-w300-h300",
                "categoryName": "음식점 · 카페",
                "placeName": "비사이드그라운드",
                "x": 128.90304529019443,
                "y": 37.761153305137384
            },
            {
                "placeId": 166,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZNc0MQIPvFz0hNP5FkOqUrpBAPiF9QfIX3UVvZCtNVhMyX2I-f50XO3NYTBq21eY9wQAJZBtuOkUcLjSqKac2bGTJwS6cjsnGydC310OM73wk7Mq6JM8XW4ofKoZCwTaAIBLqvzmAmh0mcYRjH8E6-Z6g=s4800-w300-h300",
                "categoryName": "음식점 · 카페",
                "placeName": "교동899",
                "x": 128.891956470433,
                "y": 37.7611337216823
            },
            {
                "placeId": 164,
                "placeImageUrl": "https://lh3.googleusercontent.com/places/ANXAkqH_2f0afkfp3XSAybIzXi9CSIdcGx88pO3kHC62Q0eTCueuXi5Vy6hxo3Tb4OE8coGhW5a7AtnZGhzRyv13LtxtJcr6UF3aeCU=s4800-w300-h300",
                "categoryName": "음식점 · 카페",
                "placeName": "강릉샌드",
                "x": 128.898751184116,
                "y": 37.7550139910327
            },
            {
                "placeId": 162,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZMUNxPZH1HfwyFNWNqSd73-JgcsUy2S4Cci-WceIzhgIbNaPrQiyn1AdPz5H7HUV_QkufcWHebXoDvW9s9-DIN9wj1IaSTOA45i-a6euz8lKzPJ6Vi1KQZptaXPrU0UDiBIg6Znlxtr-8JMX0c=s4800-w300-h300",
                "categoryName": "음식점 · 카페",
                "placeName": "르봉마젤",
                "x": 128.893375179986,
                "y": 37.7569634517588
            },
            {
                "placeId": 167,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZMrBmMbROSt1iTdZfpct5pGNo4DA2OggVJS488Jm3YNQZYA3nFSq640y8kCx6lA_YDaEKr4IV0ER5KcG4XdlC9-T8EHRw4Srgo84jPY_-qQc28D19wEoHpV3PdTolP0nrRq8g-Kn_gfEekENrE=s4800-w300-h300",
                "categoryName": "음식점 · 카페",
                "placeName": "홀리데이빈티지",
                "x": 128.90118926688223,
                "y": 37.76028062920354
            },
            {
                "placeId": 168,
                "placeImageUrl": "https://lh3.googleusercontent.com/places/ANXAkqGT7kjpeZhHKEVgFPjvRIja1me32QBEVKFy4mb4LoojOwTyTbdiZoFUqnIYTtbOothkH2LEdF5pYWsjCANLUzRZsKys2a70R84=s4800-w300-h300",
                "categoryName": "음식점 · 카페",
                "placeName": "리도커피",
                "x": 128.897199005826,
                "y": 37.7567893324057
            },
            {
                "placeId": 169,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZOWad6G73-wF955yJ0hqQdfN02p1f-eQwbt8xGoqiYCe0-TfN1h-kedTdIYIMaIXxjuhhqgXF8BS6mcCVQmSPq6JDiqcYGRCcF_apYdQ6QP9VdDllGm_MNeRE3S-hMkkdLiQADA6Nbjo3GrHA=s4800-w300-h300",
                "categoryName": "음식점 · 카페",
                "placeName": "에스프레소스퀘어",
                "x": 128.90130991231857,
                "y": 37.76211189350168
            },
            {
                "placeId": 170,
                "placeImageUrl": null,
                "categoryName": "음식점 · 카페",
                "placeName": "비바빌리지",
                "x": 128.899909816513,
                "y": 37.7630488348042
            },
            {
                "placeId": 171,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZOsoBCW5gkR5jM4uTnLXSDNf_59t7KYrzvfbWwwm19K7Mq7st2Yq-N_fvaT4DdyCTnOvP4QUZ60eUPFEkMzY54OQeTaksQfiAdMvEVygXoq8G_EBk0e1KRtanaFzhS0GDo98QP1MXKxPnPZHQ=s4800-w300-h300",
                "categoryName": "음식점 · 카페",
                "placeName": "강릉이래요",
                "x": 128.898688289327,
                "y": 37.7542402803726
            },
            {
                "placeId": 172,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZO2BYHyHDoFPJt-zoNzx82yHvd0mQhyfCo6467FEWi5Be-h9zFpiu4DDA4qqMw_7mjSWCmPssqt4PvtcM8PiLlrnqXH3EQ1wAPuBrIGbUiPfjfJJnxRXIakUv374nZnEMRbO9Vgu7_Cj9OMkg=s4800-w300-h300",
                "categoryName": "음식점 · 카페",
                "placeName": "가배향옥",
                "x": 128.895427201567,
                "y": 37.7576979737968
            },
            {
                "placeId": 173,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZPUwfBA6rhgQyOAVu_K1UQZZTldbZzvYOSC6BKniDYZhmn8AS8rrDsEaGOb54RyNLvr7EYCcQHXiXd5536ysq9TuTYnUi41IPT8K08eyam5rcLEUASFz4_d7HjhexjYTPgjkWpU4KlMkqrnUspPU9zp=s4800-w300-h300",
                "categoryName": "음식점 · 카페",
                "placeName": "컴포즈커피 강릉역육거리점",
                "x": 128.90136359468656,
                "y": 37.762790261033906
            },
            {
                "placeId": 174,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZMW1M8CAOhSwK624fzQpo0B9zPzAby_-ULMiX8FrLVOxS3A-jrNR9f5gPS6gpgwPqe1x4l24J07r2kogzG8aiy2PVgV01WJcqkR0aad8-nkWK5oXZU-A6m6XwAxiVEGMfHYvWv5DioQ0vRFYYI=s4800-w300-h300",
                "categoryName": "음식점 · 카페",
                "placeName": "이진리",
                "x": 128.89256415201677,
                "y": 37.76204822504747
            },
            {
                "placeId": 175,
                "placeImageUrl": "https://lh3.googleusercontent.com/places/ANXAkqFniQ9xEyXgsKXuTncYtTNM5QI3dnCKgkcw9gmxpku0JpJuLnuUGkwkJdkmPCGKnAl0I_jAtBi0ehRel4Uh5kAzDw7ex2ZoTww=s4800-w300-h300",
                "categoryName": "음식점 · 카페",
                "placeName": "까페춘식이",
                "x": 128.902361619747,
                "y": 37.7596248097627
            },
            {
                "placeId": 176,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZNzyU_sTRq-MwdjPewzXJrqgIw5SMSUI0Bk0pVfucSwYJXVv_fx0L0pxRQ8zevosoa7M3_TaWupkSp5JsOW2BeRk8k220F6OU2lbyC6v5n5nh0RucXsarGp4zNaYlILx_Lt6zcjCko88Lr-e9I=s4800-w300-h300",
                "categoryName": "음식점 · 카페",
                "placeName": "카페프코의집",
                "x": 128.90139843450575,
                "y": 37.76042859483362
            }
        ]
    },
    {
        "keyword": "공원",
        "radiusM": 2000,
        "places": [
            {
                "placeId": 177,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZOaABIMkpflH_kxTSOcWj1xMo3hMeLndCGH_XkMabuSEUF9oF4d14UUbXRgFszbcFbXeD2mzzaGq7iQPk-pOgNckOA0VFoM-kj2uIipYcYgCmdlCb0d8VxGGh9f-LGXGnCYoOy1z_D9wrk_ZA=s4800-w300-h300",
                "categoryName": "여행 · 공원",
                "placeName": "말나눔터 공원",
                "x": 128.895186645304,
                "y": 37.759298135914
            },
            {
                "placeId": 178,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZPG6VCTmEFi5mdmNLqm3SJpPaDu2CELbWclpNdLjJVHvH5NnjAwj8AgvsfhJFx0YY6Whj_MloeFp3BBAIytEbpEPztzteHZ6col5mHxExx7vx7e3e0DqFjGAQruSDVXGHdByfFIB7wepzQWWO8=s4800-w300-h300",
                "categoryName": "여행 · 공원",
                "placeName": "단오공원",
                "x": 128.896128322311,
                "y": 37.74836116791
            },
            {
                "placeId": 179,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZOaABIMkpflH_kxTSOcWj1xMo3hMeLndCGH_XkMabuSEUF9oF4d14UUbXRgFszbcFbXeD2mzzaGq7iQPk-pOgNckOA0VFoM-kj2uIipYcYgCmdlCb0d8VxGGh9f-LGXGnCYoOy1z_D9wrk_ZA=s4800-w300-h300",
                "categoryName": "여행 · 공원",
                "placeName": "남산공원",
                "x": 128.893349826023,
                "y": 37.7468888283892
            },
            {
                "placeId": 180,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZNbK6BQG_nN28GLrgkfDA4mXAtBs_RlsU-0ukR_n1h2AEy6SwRsYfxbwvBVbJTBoYQ-24glcHUnTJEkhzXlluX6Djp496AB5uvhe_zYqWzjR5fSWR9ctMrDLXaodXP48-rsjqoYd7_XQWD5Qg=s4800-w300-h300",
                "categoryName": "여행 · 공원",
                "placeName": "올밤공원",
                "x": 128.899034259071,
                "y": 37.7549914117573
            },
            {
                "placeId": 181,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZNM-DFrtRtS4X0UDRRmIZA6w0dHYEJzBdbTg_N5lVwYJdtpJVHb32f1vZupVvsJksIs-6Sj4rIIXsPrCLwHFD5dQN468PCByoEAf1lBg5TL1bAVa14XN1E6ABH7o-j3eGRXFWOIPmkhBLw3sw=s4800-w300-h300",
                "categoryName": "여행 · 공원",
                "placeName": "9호 어린이공원",
                "x": 128.904329865637,
                "y": 37.7646962718819
            },
            {
                "placeId": 182,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZNtOdDv7zQHAWDQYA7sNNWIVvWppefGjbzcRmSXOkSH3o9wtAHQir9QamyjmRryBbt0Moq97-1R5ywPaB3voBZXy5lBFPMb1W329GYJD5zHYD8lWvJNmdBM7cUDFK2Cv0st4fAF_SqXhDgwkA=s4800-w300-h300",
                "categoryName": "여행 · 공원",
                "placeName": "남대천버드나무쉼터",
                "x": 128.90149449191,
                "y": 37.7537662226753
            },
            {
                "placeId": 183,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZOnugIQ3p0ZhUDOXb2ezHVh-3cdnuXUHpR8lAOkaWepV3rLzgcj89Gy5MlBTsVfvuJJuJ9OUaSczxpZULaVnBkuzC9qawgSjvufT0NJfTifsaUfRhpb6kl8usIPJAeljXL60bRu-0n5JCDIxA=s4800-w300-h300",
                "categoryName": "여행 · 공원",
                "placeName": "장미어린이공원",
                "x": 128.906082699926,
                "y": 37.7615438110385
            },
            {
                "placeId": 184,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZOZlB2btrAyxBocJBon1ZFQOI12mnTjLP02OLfjZDcE8ogBt4IE_PBSl89kkqSteDLTYj869svjHjZ_fGWJg_KeOUsKY21SdVaRJ8IHwqplDFQwvbDS_G1LFkcSxRE6Z_QdV1y4_C3qTkphLsc=s4800-w300-h300",
                "categoryName": "여행 · 공원",
                "placeName": "라일락공원",
                "x": 128.904436033591,
                "y": 37.7621109458888
            },
            {
                "placeId": 185,
                "placeImageUrl": null,
                "categoryName": "여행 · 공원",
                "placeName": "27호 어린이공원",
                "x": 128.904613717292,
                "y": 37.7672680850373
            },
            {
                "placeId": 186,
                "placeImageUrl": null,
                "categoryName": "여행 · 공원",
                "placeName": "교동2공원",
                "x": 128.8981383593601,
                "y": 37.769789553678166
            },
            {
                "placeId": 187,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZOkF0JTDQnO_kt49cONbTVFWPKNVKq1ficjge3m2dktKwv-6egYzXVFcQt2CItm44HofDnAN7BGjZ8SicchNReQDgy6BI5fE-e33QWOer4SPi47rapv7YP9Wd-y9S3z4s--KkJw4XQvLmu1g6FSH2Yl=s4800-w300-h300",
                "categoryName": "여행 · 공원",
                "placeName": "포남소공원",
                "x": 128.907208313379,
                "y": 37.7670207162698
            },
            {
                "placeId": 188,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZOTk3xmMStpE9ssqcwyTe7P84Fk99mVl4siowl12plxEHt6znS6NdwZT5nGaBFK6B-oNWXsOi6Dwwq53EYgiIwuY6EeboZdMnKrArtGoplIYrEQrrBOyhRyuiuTIaJ8suOcdtV_43IufYCQnQ=s4800-w300-h300",
                "categoryName": "여행 · 공원",
                "placeName": "화산어린이공원",
                "x": 128.887807971553,
                "y": 37.7561339295561
            },
            {
                "placeId": 189,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZNbBJm8aksf4Z0TPpsi2yvMr6FAWVEKUosKUVEj4nHWIRw3m1nxfXQXKXd7sO0ufP-V13Ew9dOZoGkxfj9dQi6wwH3svBEoa0pZPXG7R4txyabCo-_SHoyUCIruYCMa6sT6YCevhPZzpmZT=s4800-w300-h300",
                "categoryName": "여행 · 공원",
                "placeName": "쌈지소공원",
                "x": 128.904577908626,
                "y": 37.7685262360421
            },
            {
                "placeId": 190,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZMnG9DNSPI5eBvAx789In6-3v8qaAoOgAcT2WNcQ-NQdWEemd4PrDZMBf6w1qFIVdkiGDNPQ1krqgIr4WcyJguROJr57QgMbY3RDoUB5HHxBe3NAik9RlSOahsrajMlYASvfPQXOWleu4qNVqc=s4800-w300-h300",
                "categoryName": "여행 · 공원",
                "placeName": "4호 어린이공원",
                "x": 128.903657018583,
                "y": 37.7697878829778
            },
            {
                "placeId": 191,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZMaFKseB_86qhafAhZiTR2NRuOitf2cQxkRkNdyqdRDsifF6MHqPfOfPuVxOo0AhHCdNYfpUl0Qhu5LSwui4-7IeKQP8SRL-hnM0Zf9iKjvnvUlEv5rqWtGgrX2bbier1n-RF8ezgJ144Hf=s4800-w300-h300",
                "categoryName": "여행 · 공원",
                "placeName": "35호 어린이공원",
                "x": 128.88450024196334,
                "y": 37.76649523196902
            }
        ]
    },
    {
        "keyword": "서점",
        "radiusM": 1500,
        "places": [
            {
                "placeId": 192,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZOByh0KGMaYaj-UIydHmdg_4Ee3U9-iWyVcS7WMztCUgoQ3sLXHYg_ZQnzzDGtKUMOED7UBnz3TCxzfU_qCOM_LyhepSpRcg1pDho0cmnbpqtCCVwFgyEgns5Gz7IRJb5xvxHNFCADt7IqM3g=s4800-w300-h300",
                "categoryName": "문화,예술 · 도서",
                "placeName": "지앤지오말글터",
                "x": 128.89448020537694,
                "y": 37.754735020269194
            },
            {
                "placeId": 193,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZP-DjyXO8Ro0tfmzmGrXE5nyi28ySsQhpEdFOdiDSLPLKC83l-Uv-3a_zfYRhgEgKDlmHqImYQb5yzwowDDTzKNfSWEGMRUPMofvpt2yYTYSMsPTSFFn8WV6az9OPCsOgoQhCxTDWph1HcK=s4800-w300-h300",
                "categoryName": "문화,예술 · 도서",
                "placeName": "깨북",
                "x": 128.89185735764235,
                "y": 37.760093939685866
            },
            {
                "placeId": 194,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZOpnwtHzKsgl3u7USUdNAcbM0g9ne8CNPKi4_5PjCUxOgh_8_kfdXt6sVDyPxZqc6d7I06fMdNJCiRcCv5B5WsNjpoV8MeIs4IpcFvshEQdPAyjPjxVnITEwE57K4e4vSTsOpPrwnCDISHPRg=s4800-w300-h300",
                "categoryName": "문화,예술 · 도서",
                "placeName": "강다방 이야기공장",
                "x": 128.901138255033,
                "y": 37.7627200287555
            },
            {
                "placeId": 195,
                "placeImageUrl": "https://lh3.googleusercontent.com/places/ANXAkqEjmdgqQQ-EQruTQb7LMcsJmD5feurdLdXA4q_UICkp5oB1iykBYpoYmWmoBuaN0iyZJ2A0nPIWzJcbDHnvwOlhtLjLlJ74jz4=s4800-w300-h300",
                "categoryName": "문화,예술 · 도서",
                "placeName": "윤슬서림",
                "x": 128.89238877506554,
                "y": 37.75365248710487
            },
            {
                "placeId": 196,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZMUccsWnjH3E58Uo_438GMu5igkhtnili48_z1q5H5hX195PyRut0t9g0hW3pVKlSqJUg92PivJxLof73NcXSheJRD_nIgyYfl-NYVX_xGymalLPTg4HaBxdvwppiGWQKP-4lxwNxudb2R5=s4800-w300-h300",
                "categoryName": "문화,예술 · 도서",
                "placeName": "고래책방",
                "x": 128.897193687154,
                "y": 37.7582244593217
            },
            {
                "placeId": 197,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZORdWPqIJGzvXU7VJB5e7JXf8q3AHK9SUZ_c6qqFqsgh-gKcGZ4vnJc2m-lrd2GVDu_F7Q9yq2jH7DQ6hPvnwp18jDi_FkxVypDxVQy61zbqaVxiDMJqqTZtdlvNk2Mckha2GUUsbXxfmN2XW395wRwrg=s4800-w300-h300",
                "categoryName": "문화,예술 · 도서",
                "placeName": "당신의강릉 본점",
                "x": 128.89421574542,
                "y": 37.7586903675485
            },
            {
                "placeId": 198,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZOBK04vZSjTlAzxHAxeDJHw4XXwhIObMT9kdqeabK1W47OrCN7VI8LGzK4Y7Qwu0FMGYR9pHG0HtHCkPxsH54pUDALMI0jyOXOP0_V01ix_TjBcz4wyBmdk0GgrtGRJjYf9DE8FuzBUuS-g6Q=s4800-w300-h300",
                "categoryName": "문화,예술 · 도서",
                "placeName": "한낮의바다",
                "x": 128.889092246907,
                "y": 37.7577348616983
            },
            {
                "placeId": 199,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZMAMlnLk7vo9LWMczI81XqgJZQiQrZBAdPJ0Np1EaTm3KkP5uu3nmPg406iNuiB5AI-YEUJli3ZaYRphKp7MmG1Df8h_HW7AJ8V6xhY6_ZZWX7-YJvF9oxcPiYBgnJ58NGnwNCEnqx0eNBNbA=s4800-w300-h300",
                "categoryName": "문화,예술 · 도서",
                "placeName": "책마루",
                "x": 128.9025570932,
                "y": 37.7630025085272
            },
            {
                "placeId": 200,
                "placeImageUrl": null,
                "categoryName": "문화,예술 · 도서",
                "placeName": "홀림서림",
                "x": 128.904695365537,
                "y": 37.7607194590606
            },
            {
                "placeId": 201,
                "placeImageUrl": null,
                "categoryName": "교육,학문 · 학습시설",
                "placeName": "웅진다책문고",
                "x": 128.900428970765,
                "y": 37.7554013267877
            },
            {
                "placeId": 202,
                "placeImageUrl": null,
                "categoryName": "문화,예술 · 도서",
                "placeName": "좋은서점",
                "x": 128.902431417316,
                "y": 37.7589831847024
            },
            {
                "placeId": 203,
                "placeImageUrl": null,
                "categoryName": "음식점 · 카페",
                "placeName": "언덕위에책밭",
                "x": 128.8842760743048,
                "y": 37.75426356436509
            },
            {
                "placeId": 204,
                "placeImageUrl": null,
                "categoryName": "교육,학문 · 학습시설",
                "placeName": "새마을문고작은도서관",
                "x": 128.905749308007,
                "y": 37.7687135836654
            },
            {
                "placeId": 205,
                "placeImageUrl": "https://lh3.googleusercontent.com/places/ANXAkqEjmdgqQQ-EQruTQb7LMcsJmD5feurdLdXA4q_UICkp5oB1iykBYpoYmWmoBuaN0iyZJ2A0nPIWzJcbDHnvwOlhtLjLlJ74jz4=s4800-w300-h300",
                "categoryName": "문화,예술 · 도서",
                "placeName": "문화서림",
                "x": 128.89000489957,
                "y": 37.7540051470643
            },
            {
                "placeId": 206,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZMcza1-r_H_1sBQAAXyLWBQ_Ly3PFAwhhrGmegwuypA8tn41kwBHwSChUhPrm8nVTlEyM9T1dLSAdToeSKAzzXkJea6SsP3h-eriJgeRKEZf2EikVVhGFpNsM3nbSni5W2hUZkoa6zMRk0FeA=s4800-w300-h300",
                "categoryName": "문화,예술 · 도서",
                "placeName": "강릉기독교백화점",
                "x": 128.89159289348214,
                "y": 37.75505707049716
            }
        ]
    },
    {
        "keyword": "베이커리",
        "radiusM": 1500,
        "places": [
            {
                "placeId": 119,
                "placeImageUrl": null,
                "categoryName": "음식점 · 간식",
                "placeName": "바로방",
                "x": 128.89930472671793,
                "y": 37.757581476452074
            },
            {
                "placeId": 120,
                "placeImageUrl": null,
                "categoryName": "음식점 · 간식",
                "placeName": "니어즈",
                "x": 128.901980826532,
                "y": 37.7586238176338
            },
            {
                "placeId": 125,
                "placeImageUrl": "https://lh3.googleusercontent.com/places/ANXAkqFYCFBhEkh9c5z_7rDSke3TZfLBWqtnQ3NYKwLPULeWx9O4Zyp2ucRGFW_hgucGpKG51FD9JYQh9BDgXpXVRPgArpTOt4BiZV0=s4800-w300-h300",
                "categoryName": "음식점 · 간식",
                "placeName": "라스텔리나",
                "x": 128.89985483705826,
                "y": 37.7620975325814
            },
            {
                "placeId": 123,
                "placeImageUrl": "https://lh3.googleusercontent.com/places/ANXAkqHo54wDDuztZMblNu7xLETfbsP5a1e2AD-TCoW95KaGFBhxkYLe8jcYORdHHcFUyIANaMsfUL6PZuKeSrCkTGogFTrZrpU1mto=s4800-w300-h300",
                "categoryName": "음식점 · 간식",
                "placeName": "솔방울제과점",
                "x": 128.894454287785,
                "y": 37.7610134069008
            },
            {
                "placeId": 128,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZOboTPVi9AWHmyDZVyZBEVaeWbd6gfM_31nd7elxEsepDXtUfSL_Onp3_T5jj2oCZTLy3rFe7CF4t3RJDI7dCLdkVrAS3aPIj2mfkUSiQnuM1TF2VuUJpm6dlGQ1yUucSfBzfwM9a3gnUFlAg=s4800-w300-h300",
                "categoryName": "음식점 · 간식",
                "placeName": "스위트홈베이커리",
                "x": 128.89725119050902,
                "y": 37.759364899857864
            },
            {
                "placeId": 122,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZM3C21fhOpy2N0eoLbrRaw3pe9b71Lzb8YzD_ncteBCdHySh0i8Dl0qQFYiF3qmJ7ezCMwJ9Z8hb7Gyej1BQYuroTTvGUyOo1m5sndCq5_Jw6hLRtjR-hMxLEI0mS4ufPqB9OYu3RbXZM7Sl0KGE1d1Kw=s4800-w300-h300",
                "categoryName": "음식점 · 간식",
                "placeName": "만동제과 강릉점",
                "x": 128.89950386300762,
                "y": 37.755164009855186
            },
            {
                "placeId": 121,
                "placeImageUrl": "https://lh3.googleusercontent.com/places/ANXAkqHjlsnKP198FUgZ5Mln-ROH2gyaQduGDZR8qa11tB-n6RbefIredszzdQjakU-u59Voi6BPPRDwDwIk8N8330eCdCuVDYbGtn4=s4800-w300-h300",
                "categoryName": "음식점 · 간식",
                "placeName": "상록당",
                "x": 128.899765620896,
                "y": 37.7553282467857
            },
            {
                "placeId": 124,
                "placeImageUrl": "https://lh3.googleusercontent.com/places/ANXAkqF6RAITZ_cTnIm35Pl5Z9GvCQ9EWvo_hNA8O2Kz1Z_eujGkF81kikw1O6uol_tqFdd8r66FU84uXgZdFxdxSA3tJKempfZ-84I=s4800-w300-h300",
                "categoryName": "음식점 · 간식",
                "placeName": "베이커리듬뿍",
                "x": 128.894726692631,
                "y": 37.7597712693886
            },
            {
                "placeId": 129,
                "placeImageUrl": null,
                "categoryName": "음식점 · 간식",
                "placeName": "강릉당커피콩빵 강릉역점",
                "x": 128.900315345826,
                "y": 37.7639080020163
            },
            {
                "placeId": 130,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZM1E2CUhEMWSF_xqMHcUoVRBOW8wZPmWeg9PNboddT7YUKqNw1sReZVSrPidXZohscxUiXHSDlJimbbBtgcOTmKif8St-ypar_Yxv-AedHq9Lwg8L_Yr5GYgiyXzXqlEXUk_pDc-VtQgLlb=s4800-w300-h300",
                "categoryName": "음식점 · 간식",
                "placeName": "교동빵집",
                "x": 128.892264814264,
                "y": 37.7577379988305
            },
            {
                "placeId": 207,
                "placeImageUrl": null,
                "categoryName": "음식점 · 간식",
                "placeName": "베이클라인",
                "x": 128.89868967346285,
                "y": 37.754605099151384
            },
            {
                "placeId": 117,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZMUccsWnjH3E58Uo_438GMu5igkhtnili48_z1q5H5hX195PyRut0t9g0hW3pVKlSqJUg92PivJxLof73NcXSheJRD_nIgyYfl-NYVX_xGymalLPTg4HaBxdvwppiGWQKP-4lxwNxudb2R5=s4800-w300-h300",
                "categoryName": "음식점 · 간식",
                "placeName": "고래빵집",
                "x": 128.897219076477,
                "y": 37.7582411664593
            },
            {
                "placeId": 132,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZOYwJ_G_DAAsfvXCCeedfXA3hXLezUEqODskWiHhkCI8apfZEJJja_ra6p6luyMHxk-WnY-lzJRi7bDChwfLhbmMw2V7Nsqp9B7gAZ0e6vhLaYmTblII6IC2NTq-9dA1mC4ONgFIUjMfCUThV0ML3eJQw=s4800-w300-h300",
                "categoryName": "음식점 · 간식",
                "placeName": "루쿠키",
                "x": 128.900263403345,
                "y": 37.758420015209
            },
            {
                "placeId": 131,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZORIDg6pv-T7qAo6XqeQ0ID8j5hb4LFdRl8btZB9uoiKWdOGqSQXdOtYbUT-QZD9trCzss_wx3VMR2RanQWhpAe30Sr4rMgVcm1oabEZIcPcDbcIw_X9FIc4kxhRESyYUp7hOBwrpeEVsW0Yw=s4800-w300-h300",
                "categoryName": "음식점 · 간식",
                "placeName": "인솔트베이커리",
                "x": 128.89327530682579,
                "y": 37.75749655384535
            },
            {
                "placeId": 208,
                "placeImageUrl": "https://lh3.googleusercontent.com/places/ANXAkqFANlySbshlXIZEo9FCS9KRgHeg7bE24wQ1bo8y3aISgCJsplLYh4j59eykOrYzFF08XFKAxCY7ESaHkwYweGZnihUoTQ6zF1g=s4800-w300-h300",
                "categoryName": "음식점 · 간식",
                "placeName": "얼 강릉점",
                "x": 128.902098738064,
                "y": 37.7619424137436
            }
        ]
    },
    {
        "keyword": "전망좋은",
        "radiusM": 2000,
        "places": []
    }
]
```

# PLACE-19. 플랜에 장소 추가
## URL : POST api/plan-place/{planId}

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 |

## 코드 예시

### 요청

```jsx
{
    "placeId" : 1
    "order" : 3
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

