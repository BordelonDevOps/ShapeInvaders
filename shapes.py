import pygame
import math
import random
import json
import os
import sys
from typing import List, Dict, Optional, Union

# Initialize Pygame
pygame.init()
pygame.mixer.init()

# Constants
WIDTH = 1024
HEIGHT = 768
FPS = 60

# Colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (255, 0, 0)
NEON_GREEN = (0, 255, 100)
YELLOW = (255, 255, 0)
BLUE = (0, 0, 255)
PURPLE = (128, 0, 128)
ORANGE = (255, 165, 0)
CYAN = (0, 255, 255)
GRAY = (128, 128, 128)  # Added missing color definition

# Setup
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Shape Invaders")
clock = pygame.time.Clock()

# Fonts
font_large = pygame.font.SysFont(None, 64)
font = pygame.font.SysFont(None, 36)
font_small = pygame.font.SysFont(None, 24)

class Projectile:
    def __init__(self, x: float, y: float, angle: float, speed: float = 10, 
                 damage: float = 10, size: int = 5, color: tuple = WHITE):
        self.x = x
        self.y = y
        self.speed = speed
        self.angle = angle
        self.damage = damage
        self.size = size
        self.color = color

    def update(self) -> None:
        self.x += self.speed * math.cos(math.radians(self.angle))
        self.y += self.speed * math.sin(math.radians(self.angle))

    def draw(self, screen: pygame.Surface) -> None:
        pygame.draw.circle(screen, self.color, (int(self.x), int(self.y)), self.size)

class Player:
    def __init__(self):
        self.x = WIDTH // 2
        self.y = HEIGHT - 100
        self.base_speed = 5
        self.speed = self.base_speed
        self.angle = -90
        self.size = 20
        self.health = 100
        self.max_health = 100
        self.level = 1
        self.xp = 0
        self.xp_to_level = 100
        self.score = 0
        self.projectiles: List[Projectile] = []
        self.base_shoot_cooldown = 15
        self.shoot_cooldown = 0
        self.dash_cooldown = 0
        self.iframes = 0
        self.damage_multiplier = 1.0
        self.shape = "triangle"
        self.bullet_patterns = {
            "triangle": {"spread": 0, "bullets": 1},
            "circle": {"spread": 15, "bullets": 3},
            "square": {"spread": 0, "bullets": 4},
            "pentagon": {"spread": 72, "bullets": 5}
        }
        self.unlocked_shapes = ["triangle"]
        self.power_up_timer = 0
        self.power_up_type = None
        self.ultimate_charge = 0
        self.ultimate_cooldown = 0

    def move(self, keys: pygame.key.ScancodeWrapper) -> None:
        speed = self.speed * 2 if keys[pygame.K_LSHIFT] and self.dash_cooldown <= 0 else self.speed
        
        if keys[pygame.K_LSHIFT] and self.dash_cooldown <= 0:
            self.dash_cooldown = 60
            self.iframes = 15

        if keys[pygame.K_a] and self.x > self.size:
            self.x -= speed
        if keys[pygame.K_d] and self.x < WIDTH - self.size:
            self.x += speed
        if keys[pygame.K_w] and self.y > self.size:
            self.y -= speed
        if keys[pygame.K_s] and self.y < HEIGHT - self.size:
            self.y += speed

    def rotate(self, mouse_pos: tuple) -> None:
        rel_x = mouse_pos[0] - self.x
        rel_y = mouse_pos[1] - self.y
        self.angle = math.degrees(math.atan2(rel_y, rel_x)) - 90

    def shoot(self) -> None:
        if self.shoot_cooldown <= 0:
            pattern = self.bullet_patterns[self.shape]
            base_damage = 10 * self.damage_multiplier
            
            if pattern["bullets"] == 1:
                self.projectiles.append(Projectile(self.x, self.y, self.angle, damage=base_damage))
            else:
                spread = pattern["spread"]
                for i in range(pattern["bullets"]):
                    angle_offset = (i * (360 / pattern["bullets"])) if pattern["bullets"] > 2 else (
                        -spread if i == 0 else (0 if i == 1 else spread))
                    self.projectiles.append(Projectile(self.x, self.y, self.angle + angle_offset, 
                                                     damage=base_damage * 0.8))
            
            self.shoot_cooldown = self.base_shoot_cooldown

    def ultimate(self) -> None:
        if self.ultimate_charge >= 100 and self.ultimate_cooldown <= 0:
            if self.shape == "triangle":
                # Rapid fire burst
                self.shoot_cooldown = 2
                self.power_up_timer = 180
            elif self.shape == "circle":
                # Circle of death
                for angle in range(0, 360, 10):
                    self.projectiles.append(Projectile(self.x, self.y, angle, 
                                                     damage=20 * self.damage_multiplier))
            elif self.shape == "square":
                # Shield wall
                self.iframes = 180
                self.health = min(self.max_health, self.health + 50)
            
            self.ultimate_charge = 0
            self.ultimate_cooldown = 600

    def update(self) -> None:
        if self.shoot_cooldown > 0:
            self.shoot_cooldown -= 1
        if self.dash_cooldown > 0:
            self.dash_cooldown -= 1
        if self.iframes > 0:
            self.iframes -= 1
        if self.power_up_timer > 0:
            self.power_up_timer -= 1
            if self.power_up_timer == 0:
                self.power_up_type = None
                self.shoot_cooldown = self.base_shoot_cooldown
        if self.ultimate_cooldown > 0:
            self.ultimate_cooldown -= 1

        # Update projectiles
        for proj in self.projectiles[:]:
            proj.update()
            if not (0 <= proj.x <= WIDTH and 0 <= proj.y <= HEIGHT):
                self.projectiles.remove(proj)

    def draw(self, screen: pygame.Surface) -> None:
        # Flash when invincible
        color = NEON_GREEN if self.iframes % 4 < 2 else WHITE
        if self.power_up_type:
            color = YELLOW if self.power_up_type == "rapid" else BLUE if self.power_up_type == "spread" else PURPLE

        # Draw shape based on current form
        if self.shape == "triangle":
            points = [
                (self.x + self.size * math.cos(math.radians(self.angle)),
                 self.y + self.size * math.sin(math.radians(self.angle))),
                (self.x + self.size * math.cos(math.radians(self.angle + 120)),
                 self.y + self.size * math.sin(math.radians(self.angle + 120))),
                (self.x + self.size * math.cos(math.radians(self.angle - 120)),
                 self.y + self.size * math.sin(math.radians(self.angle - 120)))
            ]
            pygame.draw.polygon(screen, color, points, 2)
        elif self.shape == "circle":
            pygame.draw.circle(screen, color, (int(self.x), int(self.y)), self.size, 2)
        elif self.shape == "square":
            points = [
                (self.x + self.size * math.cos(math.radians(self.angle + 45)),
                 self.y + self.size * math.sin(math.radians(self.angle + 45))),
                (self.x + self.size * math.cos(math.radians(self.angle + 135)),
                 self.y + self.size * math.sin(math.radians(self.angle + 135))),
                (self.x + self.size * math.cos(math.radians(self.angle + 225)),
                 self.y + self.size * math.sin(math.radians(self.angle + 225))),
                (self.x + self.size * math.cos(math.radians(self.angle + 315)),
                 self.y + self.size * math.sin(math.radians(self.angle + 315)))
            ]
            pygame.draw.polygon(screen, color, points, 2)

        # Draw health bar
        health_width = 40 * (self.health / self.max_health)
        pygame.draw.rect(screen, RED, (self.x - 20, self.y - 30, 40, 5))
        pygame.draw.rect(screen, NEON_GREEN, (self.x - 20, self.y - 30, health_width, 5))

        # Draw power-up timer
        if self.power_up_timer > 0:
            timer_width = 40 * (self.power_up_timer / 300)
            pygame.draw.rect(screen, ORANGE, (self.x - 20, self.y - 25, timer_width, 3))

        # Draw ultimate charge
        if self.ultimate_charge > 0:
            charge_width = 40 * (self.ultimate_charge / 100)
            pygame.draw.rect(screen, CYAN, (self.x - 20, self.y - 35, charge_width, 3))

class Enemy:
    def __init__(self, x: float, y: float, enemy_type: str = "normal"):
        self.x = x
        self.y = y
        self.type = enemy_type
        self.speed = 2
        self.size = 20
        self.health = 30
        self.max_health = 30
        self.color = RED
        self.projectiles: List[Projectile] = []
        self.shoot_cooldown = 0
        self.value = 100  # Score value

    def update(self, player: Player) -> None:
        dx = player.x - self.x
        dy = player.y - self.y
        dist = max(1, math.hypot(dx, dy))
        self.x += self.speed * dx / dist
        self.y += self.speed * dy / dist

        if self.shoot_cooldown > 0:
            self.shoot_cooldown -= 1

    def draw(self, screen: pygame.Surface) -> None:
        pygame.draw.circle(screen, self.color, (int(self.x), int(self.y)), self.size, 2)
        health_width = 40 * (self.health / self.max_health)
        pygame.draw.rect(screen, RED, (self.x - 20, self.y - 30, 40, 5))
        pygame.draw.rect(screen, NEON_GREEN, (self.x - 20, self.y - 30, health_width, 5))

class FastEnemy(Enemy):
    def __init__(self, x: float, y: float):
        super().__init__(x, y, "fast")
        self.speed = 4
        self.health = 20
        self.max_health = 20
        self.color = YELLOW
        self.size = 15
        self.value = 150

class ShootingEnemy(Enemy):
    def __init__(self, x: float, y: float):
        super().__init__(x, y, "shooter")
        self.speed = 1.5
        self.health = 40
        self.max_health = 40
        self.color = BLUE
        self.shoot_cooldown = 60
        self.value = 200

    def update(self, player: Player) -> None:
        super().update(player)
        if self.shoot_cooldown <= 0:
            angle = math.degrees(math.atan2(player.y - self.y, player.x - self.x))
            self.projectiles.append(Projectile(self.x, self.y, angle, speed=7, color=BLUE))
            self.shoot_cooldown = 60

class BossEnemy(Enemy):
    def __init__(self, x: float, y: float):
        super().__init__(x, y, "boss")
        self.speed = 1
        self.size = 40
        self.health = 500
        self.max_health = 500
        self.color = PURPLE
        self.phase = 1
        self.shoot_cooldown = 30
        self.value = 1000
        self.attack_pattern = 0

    def update(self, player: Player) -> None:
        super().update(player)
        
        # Change phase based on health
        self.phase = 3 if self.health < self.max_health * 0.3 else (
                     2 if self.health < self.max_health * 0.6 else 1)

        if self.shoot_cooldown <= 0:
            if self.phase == 1:
                # Simple attack pattern
                angle = math.degrees(math.atan2(player.y - self.y, player.x - self.x))
                for offset in [-20, -10, 0, 10, 20]:
                    self.projectiles.append(Projectile(self.x, self.y, angle + offset, 
                                                     speed=6, color=PURPLE))
            elif self.phase == 2:
                # Spiral pattern
                for i in range(8):
                    angle = (self.attack_pattern + i * 45) % 360
                    self.projectiles.append(Projectile(self.x, self.y, angle, 
                                                     speed=5, color=PURPLE))
                self.attack_pattern = (self.attack_pattern + 20) % 360
            else:
                # Desperate phase
                for angle in range(0, 360, 30):
                    self.projectiles.append(Projectile(self.x, self.y, angle, 
                                                     speed=7, color=RED))
            
            self.shoot_cooldown = 60 if self.phase < 3 else 45

class PowerUp:
    def __init__(self, x: float, y: float, power_type: str):
        self.x = x
        self.y = y
        self.type = power_type
        self.size = 15
        self.colors = {
            "rapid": YELLOW,
            "spread": BLUE,
            "shield": PURPLE,
            "damage": RED,
            "speed": NEON_GREEN
        }

    def draw(self, screen: pygame.Surface) -> None:
        pygame.draw.circle(screen, self.colors[self.type], (int(self.x), int(self.y)), self.size)

class UpgradeSystem:
    def __init__(self):
        self.upgrades = {
            "health": {"cost": 500, "level": 0, "max_level": 5},
            "speed": {"cost": 400, "level": 0, "max_level": 3},
            "damage": {"cost": 600, "level": 0, "max_level": 3},
            "fire_rate": {"cost": 450, "level": 0, "max_level": 4}
        }

    def can_upgrade(self, upgrade_type: str, score: int) -> bool:
        upgrade = self.upgrades[upgrade_type]
        return score >= upgrade["cost"] and upgrade["level"] < upgrade["max_level"]

    def apply_upgrade(self, player: Player, upgrade_type: str) -> int:
        upgrade = self.upgrades[upgrade_type]
        cost = upgrade["cost"]
        
        if upgrade_type == "health":
            player.max_health += 25
            player.health = player.max_health
        elif upgrade_type == "speed":
            player.base_speed += 0.5
            player.speed = player.base_speed
        elif upgrade_type == "damage":
            player.damage_multiplier += 0.2
        elif upgrade_type == "fire_rate":
            player.base_shoot_cooldown = max(5, player.base_shoot_cooldown - 2)

        upgrade["level"] += 1
        upgrade["cost"] = int(upgrade["cost"] * 1.5)
        return cost

class Game:
    def __init__(self):
        self.state = "menu"
        self.player = Player()
        self.enemies: List[Enemy] = []
        self.power_ups: List[PowerUp] = []
        self.wave = 0
        self.spawn_timer = 0
        self.wave_in_progress = False
        self.score_multiplier = 1.0
        self.combo_timer = 0
        self.combo_count = 0
        self.high_score = self.load_high_score()
        self.upgrade_system = UpgradeSystem()
        self.show_upgrade_menu = False
        self.selected_upgrade = 0
        self.boss_spawned = False

    def spawn_wave(self) -> None:
        if not self.wave_in_progress and not self.enemies:
            self.wave += 1
            self.wave_in_progress = True
            self.spawn_timer = FPS
            self.boss_spawned = False

            # Unlock new shapes at certain waves
            if self.wave == 5 and "circle" not in self.player.unlocked_shapes:
                self.player.unlocked_shapes.append("circle")
            elif self.wave == 10 and "square" not in self.player.unlocked_shapes:
                self.player.unlocked_shapes.append("square")

    def spawn_enemies(self) -> None:
        if self.wave % 5 == 0 and not self.boss_spawned:
            # Boss wave
            self.enemies.append(BossEnemy(WIDTH/2, 50))
            self.boss_spawned = True
            self.wave_in_progress = False
        elif len(self.enemies) < self.wave * 2:
            # Regular wave
            angle = random.uniform(0, 2 * math.pi)
            distance = random.uniform(300, 400)
            x = self.player.x + distance * math.cos(angle)
            y = self.player.y + distance * math.sin(angle)
            x = max(50, min(WIDTH - 50, x))
            y = max(50, min(HEIGHT - 50, y))
            
            enemy_type = random.choices(
                [Enemy, FastEnemy, ShootingEnemy],
                weights=[0.6, 0.25, 0.15],
                k=1
            )[0]
            self.enemies.append(enemy_type(x, y))

    def save_high_score(self) -> None:
        try:
            with open("high_score.txt", "w") as f:
                f.write(str(self.high_score))
        except:
            pass

    def load_high_score(self) -> int:
        try:
            with open("high_score.txt", "r") as f:
                return int(f.read())
        except:
            return 0

    def apply_power_up(self, power_type: str) -> None:  # Added missing method
        if power_type == "rapid":
            self.player.power_up_type = "rapid"
            self.player.shoot_cooldown = 5
            self.player.power_up_timer = 300
        elif power_type == "spread":
            self.player.power_up_type = "spread"
            self.player.power_up_timer = 300
        elif power_type == "shield":
            self.player.iframes = 300
            self.player.health = min(self.player.max_health, self.player.health + 20)
        elif power_type == "damage":
            self.player.damage_multiplier *= 1.5
            self.player.power_up_timer = 300
        elif power_type == "speed":
            self.player.speed = self.player.base_speed * 1.5
            self.player.power_up_timer = 300

    def update(self) -> None:
        if self.state == "game" and not self.show_upgrade_menu:
            # Spawn enemies
            if self.wave_in_progress and self.spawn_timer <= 0:
                self.spawn_enemies()
                self.spawn_timer = FPS // 2
            elif self.spawn_timer > 0:
                self.spawn_timer -= 1

            # Update player
            keys = pygame.key.get_pressed()
            mouse_pos = pygame.mouse.get_pos()
            self.player.move(keys)
            self.player.rotate(mouse_pos)
            self.player.update()

            # Update enemies and their projectiles
            for enemy in self.enemies[:]:
                enemy.update(self.player)
                
                # Update enemy projectiles
                for proj in enemy.projectiles[:]:
                    proj.update()
                    if not (0 <= proj.x <= WIDTH and 0 <= proj.y <= HEIGHT):
                        enemy.projectiles.remove(proj)
                    elif math.hypot(proj.x - self.player.x, proj.y - self.player.y) < self.player.size + proj.size:
                        if self.player.iframes <= 0:
                            self.player.health -= 10
                            self.player.iframes = 60
                            self.combo_count = 0
                            if self.player.health <= 0:
                                self.state = "game_over"
                                if self.player.score > self.high_score:
                                    self.high_score = self.player.score
                                    self.save_high_score()
                        enemy.projectiles.remove(proj)

            # Check player projectile collisions
            for proj in self.player.projectiles[:]:
                for enemy in self.enemies[:]:
                    if math.hypot(proj.x - enemy.x, proj.y - enemy.y) < enemy.size + proj.size:
                        enemy.health -= proj.damage
                        if enemy.health <= 0:
                            self.enemies.remove(enemy)
                            self.player.score += int(enemy.value * self.score_multiplier)
                            self.player.ultimate_charge = min(100, self.player.ultimate_charge + 10)
                            self.combo_count += 1
                            self.combo_timer = 120
                            self.score_multiplier = 1 + (self.combo_count * 0.1)
                            
                            # Random power-up drop
                            if random.random() < 0.1:  # 10% chance
                                power_type = random.choice(["rapid", "spread", "shield", "damage", "speed"])
                                self.power_ups.append(PowerUp(enemy.x, enemy.y, power_type))
                        
                        self.player.projectiles.remove(proj)
                        break

            # Update power-ups
            for power_up in self.power_ups[:]:
                if math.hypot(power_up.x - self.player.x, power_up.y - self.player.y) < power_up.size + self.player.size:
                    self.apply_power_up(power_up.type)
                    self.power_ups.remove(power_up)

            # Update combo system
            if self.combo_timer > 0:
                self.combo_timer -= 1
            else:
                self.combo_count = 0
                self.score_multiplier = 1

            # Spawn new wave if needed
            if not self.enemies and not self.wave_in_progress:
                self.spawn_wave()

    def draw(self) -> None:
        screen.fill(BLACK)
        
        if self.state == "menu":
            # Draw menu
            title = font_large.render("SHAPE INVADERS", True, WHITE)
            start = font.render("Press SPACE to Start", True, WHITE)
            controls = font_small.render("WASD to move, Mouse to aim, Click to shoot", True, WHITE)
            if self.high_score > 0:
                high_score = font.render(f"High Score: {self.high_score}", True, WHITE)
                screen.blit(high_score, (WIDTH//2 - high_score.get_width()//2, HEIGHT//2 + 50))
            
            screen.blit(title, (WIDTH//2 - title.get_width()//2, HEIGHT//3))
            screen.blit(start, (WIDTH//2 - start.get_width()//2, HEIGHT//2))
            screen.blit(controls, (WIDTH//2 - controls.get_width()//2, HEIGHT//2 + 100))

        elif self.state == "game":
            # Draw game elements
            self.player.draw(screen)
            for proj in self.player.projectiles:
                proj.draw(screen)
            
            for enemy in self.enemies:
                enemy.draw(screen)
                for proj in enemy.projectiles:
                    proj.draw(screen)
            
            for power_up in self.power_ups:
                power_up.draw(screen)

            # Draw HUD
            score_text = font.render(f"Score: {self.player.score}", True, WHITE)
            wave_text = font.render(f"Wave: {self.wave}", True, WHITE)
            health_text = font.render(f"HP: {int(self.player.health)}/{self.player.max_health}", True, WHITE)
            
            screen.blit(score_text, (10, 10))
            screen.blit(wave_text, (10, 50))
            screen.blit(health_text, (10, 90))

            if self.combo_count > 1:
                combo_text = font.render(f"{self.combo_count}x Combo!", True, YELLOW)
                screen.blit(combo_text, (WIDTH - 150, 10))

            # Draw shape selector
            shape_text = font_small.render("Shapes:", True, WHITE)
            screen.blit(shape_text, (WIDTH - 150, HEIGHT - 60))
            for i, shape in enumerate(self.player.unlocked_shapes):
                color = NEON_GREEN if shape == self.player.shape else WHITE
                key_text = font_small.render(f"{i+1}: {shape}", True, color)
                screen.blit(key_text, (WIDTH - 140, HEIGHT - 30 + i*20))

            # Draw upgrade menu if active
            if self.show_upgrade_menu:
                self.draw_upgrade_menu()

        elif self.state == "game_over":
            over_text = font_large.render("GAME OVER", True, WHITE)
            score_text = font.render(f"Final Score: {self.player.score}", True, WHITE)
            high_score_text = font.render(f"High Score: {self.high_score}", True, WHITE)
            restart_text = font.render("Press R to Restart", True, WHITE)
            menu_text = font.render("Press M for Menu", True, WHITE)
            
            screen.blit(over_text, (WIDTH//2 - over_text.get_width()//2, HEIGHT//3))
            screen.blit(score_text, (WIDTH//2 - score_text.get_width()//2, HEIGHT//2))
            screen.blit(high_score_text, (WIDTH//2 - high_score_text.get_width()//2, HEIGHT//2 + 40))
            screen.blit(restart_text, (WIDTH//2 - restart_text.get_width()//2, HEIGHT//2 + 80))
            screen.blit(menu_text, (WIDTH//2 - menu_text.get_width()//2, HEIGHT//2 + 120))

        pygame.display.flip()

    def draw_upgrade_menu(self) -> None:
        # Draw semi-transparent overlay
        overlay = pygame.Surface((WIDTH, HEIGHT))
        overlay.fill(BLACK)
        overlay.set_alpha(128)
        screen.blit(overlay, (0, 0))

        # Draw upgrade options
        title = font_large.render("UPGRADES", True, WHITE)
        screen.blit(title, (WIDTH//2 - title.get_width()//2, 50))

        y = 150
        for upgrade_type, data in self.upgrade_system.upgrades.items():
            color = WHITE if self.upgrade_system.can_upgrade(upgrade_type, self.player.score) else GRAY
            text = font.render(
                f"{upgrade_type.title()}: Level {data['level']}/{data['max_level']} - Cost: {data['cost']}", 
                True, color
            )
            screen.blit(text, (WIDTH//2 - text.get_width()//2, y))
            y += 50

        exit_text = font.render("Press P to close", True, WHITE)
        screen.blit(exit_text, (WIDTH//2 - exit_text.get_width()//2, HEIGHT - 50))

def main():
    game = Game()
    running = True

    while running:
        clock.tick(FPS)
        
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE and game.state == "menu":
                    game.state = "game"
                elif event.key == pygame.K_r and game.state == "game_over":
                    game = Game()
                elif event.key == pygame.K_m and game.state == "game_over":
                    game = Game()
                    game.state = "menu"
                elif event.key == pygame.K_p and game.state == "game":
                    game.show_upgrade_menu = not game.show_upgrade_menu
                elif game.state == "game" and not game.show_upgrade_menu:
                    # Shape switching
                    if event.key in [pygame.K_1, pygame.K_2, pygame.K_3, pygame.K_4]:
                        shape_index = event.key - pygame.K_1
                        if shape_index < len(game.player.unlocked_shapes):
                            game.player.shape = game.player.unlocked_shapes[shape_index]
                    elif event.key == pygame.K_SPACE:
                        game.player.ultimate()

            elif event.type == pygame.MOUSEBUTTONDOWN and game.state == "game":
                if event.button == 1 and not game.show_upgrade_menu:  # Left click
                    game.player.shoot()
                elif event.button == 1 and game.show_upgrade_menu:  # Upgrade selection
                    mouse_pos = pygame.mouse.get_pos()
                    y = 150
                    for upgrade_type in game.upgrade_system.upgrades:
                        if (150 <= mouse_pos[0] <= WIDTH-150 and 
                            y <= mouse_pos[1] <= y+40 and 
                            game.upgrade_system.can_upgrade(upgrade_type, game.player.score)):
                            cost = game.upgrade_system.apply_upgrade(game.player, upgrade_type)
                            game.player.score -= cost
                        y += 50

        game.update()
        game.draw()

    pygame.quit()

if __name__ == "__main__":
    main()