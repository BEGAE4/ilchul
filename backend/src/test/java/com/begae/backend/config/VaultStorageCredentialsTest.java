package com.begae.backend.config;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;
import static org.assertj.core.api.Assertions.*;

class VaultStorageCredentialsTest {
    @Test void vaultUsesExplicitKeysForSdkInsteadOfDefaultChain() {
        var env = new MockEnvironment().withProperty("ILCHUL_RUNTIME_MODE", "vault")
                .withProperty("AWS_ACCESS_KEY_ID", "test-access")
                .withProperty("AWS_SECRET_ACCESS_KEY", "test-secret");
        var credentials = new VaultStorageCredentials().provider(env).resolveCredentials();
        assertThat(credentials.accessKeyId()).isEqualTo("test-access");
        assertThat(credentials.secretAccessKey()).isEqualTo("test-secret");
    }
    @Test void missingKeyNeverFallsBackToMachineCredentials() {
        var env = new MockEnvironment().withProperty("ILCHUL_RUNTIME_MODE", "vault");
        assertThatThrownBy(() -> new VaultStorageCredentials().provider(env))
                .hasMessage("STORAGE_CREDENTIAL_UNAVAILABLE").hasNoCause();
    }
}
