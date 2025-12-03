package org.carinsay.gamehub.service;

import org.carinsay.gamehub.model.Board;
import org.carinsay.gamehub.model.Move;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Stack;

@Service

public class GameService {

    private Board board = new Board();

    // 0 = empty, 1 = black, 2 = white
    public String playerMove(int x, int y) {

        if (!inBoard(x, y)) return "非法坐标";
        if (board.grid[x][y] != 0) return "该位置已被占用";

        board.grid[x][y] = 1; // 玩家一般下黑
        if (checkWin(1)) return "玩家胜利";

        Move aiMove = requestAiMove();

        board.grid[aiMove.x][aiMove.y] = 2;
        if (checkWin(2)) return "AI 胜利";

        return "继续游戏";
    }

    private Move requestAiMove() {
        RestTemplate rest = new RestTemplate();
        return rest.postForObject(
                "http://python:5000/move",
                board,
                Move.class
        );
    }

    private boolean inBoard(int x, int y) {
        return x >= 0 && x < 15 && y >= 0 && y < 15;
    }

    // 简单的五连判断
    private boolean checkWin(int color) {
        int[][] g = board.grid;
        int n = 15;

        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (g[i][j] != color) continue;
                if (check(g, color, i, j, 1, 0)) return true; // →
                if (check(g, color, i, j, 0, 1)) return true; // ↓
                if (check(g, color, i, j, 1, 1)) return true; // ↘
                if (check(g, color, i, j, 1, -1)) return true; // ↗
            }
        }
        return false;
    }

    private boolean check(int[][] g, int color, int x, int y, int dx, int dy) {
        for (int k = 0; k < 5; k++) {
            int nx = x + dx * k;
            int ny = y + dy * k;
            if (nx < 0 || nx >= 15 || ny < 0 || ny >= 15) return false;
            if (g[nx][ny] != color) return false;
        }
        return true;
    }

    public Board getBoard() {
        return board;
    }
}