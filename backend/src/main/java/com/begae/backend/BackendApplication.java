package com.begae.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		if (args.length == 1 && args[0].equals("--ilchul-migrate")) {
			try {
				com.begae.backend.config.RuntimeSecrets.migrate();
				System.out.println("ILCHUL_MIGRATION_OK");
			} catch (Exception ignored) {
				System.err.println("ILCHUL_MIGRATION_FAILED");
				System.exit(1);
			}
			return;
		}
		var application = new SpringApplication(BackendApplication.class);
		application.addInitializers(new com.begae.backend.config.RuntimeSecrets());
		application.run(args);
	}

}
