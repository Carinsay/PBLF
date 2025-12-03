package org.carinsay.gamehub.controller;

import lombok.extern.slf4j.Slf4j;
import org.carinsay.gamehub.model.Board;
import org.carinsay.gamehub.service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@Slf4j
@RequestMapping("/game")
public class GameController {

    @Autowired
    GameService service;

    @PostMapping("/move")
    public String move(@RequestParam int x, @RequestParam int y) {
        return service.playerMove(x, y);
    }

    @GetMapping("/board")
    public Board board() {
        return service.getBoard();
    }
}