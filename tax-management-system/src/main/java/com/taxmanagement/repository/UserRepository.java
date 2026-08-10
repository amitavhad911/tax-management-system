package com.taxmanagement.repository;

import com.taxmanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository
        extends JpaRepository<User, Long>,
                JpaSpecificationExecutor<User> {

    Optional<User> findByPanNumber(
            String panNumber
    );

    Optional<User> findByEmail(
            String email
    );

    boolean existsByPanNumber(
            String panNumber
    );

    boolean existsByEmail(
            String email
    );

    long countByUserType(
            User.UserType userType
    );
}