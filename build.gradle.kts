import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    kotlin("jvm") version "1.5.0"
}

allprojects {
    apply(plugin = "org.jetbrains.kotlin.jvm")

    repositories {
        mavenCentral()
    }

    tasks.withType<KotlinCompile> {
        kotlinOptions {
            freeCompilerArgs = listOf("-Xjsr305=strict")
            jvmTarget = "11"
        }
    }

    tasks.withType<Test> {
        useJUnitPlatform()
    }
}

subprojects {
    group = "com.dreamdisciples"
    version = "1.0-SNAPSHOT"

    java.sourceCompatibility = JavaVersion.VERSION_11

//    dependencies {
////        implementation(kotlin("stdlib"))
//
//        testImplementation(kotlin("test-junit5"))
//        testImplementation("org.junit.jupiter:junit-jupiter-api:5.6.0")
//        testImplementation("com.willowtreeapps.assertk:assertk:0.22")
//        testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine:5.6.0")
//    }
}
