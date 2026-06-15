package com.begae.backend.global.aop.require_admin;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 관리자 권한(ROLE_ADMIN)이 필요한 메서드에 적용하는 마커 어노테이션
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireAdmin {
}
